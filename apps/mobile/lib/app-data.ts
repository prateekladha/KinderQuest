import { useEffect, useState } from "react";
import {
  type AppDataRepository,
  getAppSummary,
  mockRepository,
  SupabaseAppDataRepository
} from "@kinderquest/api";
import type { AppMockData, HistoryEntityType, ParentApproval, ParentHistoryItem, StoreReward } from "@kinderquest/types";
import { getMobileSupabaseEnv } from "./env";
import { getMobileSupabaseClient } from "./supabase";

export interface AppDataState {
  data: AppMockData | null;
  isLoading: boolean;
  source: "mock" | "supabase";
}

interface HistoryPageState {
  items: ParentHistoryItem[];
  total: number;
  isLoading: boolean;
  isInitialized: boolean;
}

interface SharedSnapshotState {
  data: AppMockData | null;
  isLoading: boolean;
  source: "mock" | "supabase";
}

const EMPTY_HISTORY_STATE: Record<HistoryEntityType, HistoryPageState> = {
  task_assignment: {
    items: [],
    total: 0,
    isLoading: false,
    isInitialized: false
  },
  reward_redemption: {
    items: [],
    total: 0,
    isLoading: false,
    isInitialized: false
  }
};

const listeners = new Set<(state: SharedSnapshotState) => void>();
let sharedRepositoryPromise: Promise<AppDataRepository> | null = null;
let sharedLoadPromise: Promise<void> | null = null;
let sharedState: SharedSnapshotState = {
  data: null,
  isLoading: true,
  source: "mock"
};

function emitSharedState() {
  for (const listener of listeners) {
    listener(sharedState);
  }
}

function updateSharedState(next: Partial<SharedSnapshotState>) {
  sharedState = {
    ...sharedState,
    ...next
  };
  emitSharedState();
}

async function resolveRepository(): Promise<AppDataRepository> {
  if (!sharedRepositoryPromise) {
    sharedRepositoryPromise = (async () => {
      const env = getMobileSupabaseEnv();
      const client = getMobileSupabaseClient();
      return env && client ? new SupabaseAppDataRepository(client) : mockRepository;
    })();
  }

  return sharedRepositoryPromise;
}

async function loadSharedSnapshot(repositoryOverride?: AppDataRepository) {
  if (!sharedLoadPromise) {
    sharedLoadPromise = (async () => {
      const repository = repositoryOverride ?? (await resolveRepository());
      let next: AppMockData;
      let nextSource: "mock" | "supabase";

      try {
        next = await repository.getAppData();
        nextSource = repository instanceof SupabaseAppDataRepository ? "supabase" : "mock";
        if (__DEV__) {
          console.info(`[app-data] source=${nextSource} loaded`);
        }
      } catch (error) {
        next = await mockRepository.getAppData();
        nextSource = "mock";
        if (__DEV__) {
          console.info("[app-data] source=mock fallback-after-error");
          if (error instanceof Error) {
            console.info(`[app-data] error=${error.message}`);
          } else if (typeof error === "object" && error !== null) {
            console.info(`[app-data] error=${JSON.stringify(error)}`);
          } else {
            console.info(`[app-data] error=${String(error)}`);
          }
        }
      }

      updateSharedState({
        data: next,
        source: nextSource,
        isLoading: false
      });
    })().finally(() => {
      sharedLoadPromise = null;
    });
  }

  return sharedLoadPromise;
}

function revalidateSharedSnapshot(repositoryOverride?: AppDataRepository) {
  void loadSharedSnapshot(repositoryOverride);
}

function mutateSharedData(transform: (current: AppMockData) => AppMockData) {
  if (!sharedState.data) {
    return;
  }

  updateSharedState({
    data: transform(sharedState.data)
  });
}

function updateTaskState(data: AppMockData, taskId: string, state: "claimed" | "approved") {
  return {
    ...data,
    tasks: data.tasks.map((task) => (task.id === taskId ? { ...task, state } : task))
  };
}

function updateRewardState(
  data: AppMockData,
  rewardId: string,
  next: Partial<Pick<StoreReward, "redemptionId" | "redemptionStatus">>
) {
  return {
    ...data,
    rewards: data.rewards.map((reward) => (reward.id === rewardId ? { ...reward, ...next } : reward))
  };
}

function removeApproval(data: AppMockData, approvalId: string) {
  return {
    ...data,
    approvals: data.approvals.filter((approval) => approval.id !== approvalId)
  };
}

function findApproval(data: AppMockData, approvalId: string): ParentApproval | null {
  return data.approvals.find((approval) => approval.id === approvalId) ?? null;
}

export function resetAppDataCache() {
  sharedRepositoryPromise = null;
  sharedLoadPromise = null;
  sharedState = {
    data: null,
    isLoading: true,
    source: "mock"
  };
  emitSharedState();
}

export function useAppData(): AppDataState & {
  summary: ReturnType<typeof getAppSummary> | null;
  claimTask: (taskId: string) => Promise<void>;
  approveTaskApproval: (taskAssignmentId: string) => Promise<void>;
  rejectTaskApproval: (taskAssignmentId: string) => Promise<void>;
  approveRewardApproval: (rewardRedemptionId: string) => Promise<void>;
  rejectRewardApproval: (rewardRedemptionId: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  fulfillRewardRedemption: (rewardRedemptionId: string) => Promise<void>;
  createFamilyMemberInvite: (input: {
    email: string;
    displayName: string;
    role: "parent" | "child";
  }) => Promise<void>;
  createTask: (input: {
    title: string;
    description?: string;
    points: number;
    childMemberId?: string;
  }) => Promise<void>;
  createReward: (input: {
    title: string;
    description?: string;
    cost: number;
  }) => Promise<void>;
  historyPages: Record<HistoryEntityType, HistoryPageState>;
  loadHistoryPage: (entityType: HistoryEntityType, options?: { reset?: boolean; limit?: number }) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [snapshotState, setSnapshotState] = useState<SharedSnapshotState>(sharedState);
  const [historyPages, setHistoryPages] = useState<Record<HistoryEntityType, HistoryPageState>>(EMPTY_HISTORY_STATE);

  useEffect(() => {
    listeners.add(setSnapshotState);

    if (sharedState.data === null && sharedState.isLoading) {
      void loadSharedSnapshot();
    } else {
      setSnapshotState(sharedState);
    }

    return () => {
      listeners.delete(setSnapshotState);
    };
  }, []);

  return {
    data: snapshotState.data,
    isLoading: snapshotState.isLoading,
    source: snapshotState.source,
    summary: snapshotState.data ? getAppSummary(snapshotState.data) : null,
    refresh: async () => {
      updateSharedState({ isLoading: true });
      await loadSharedSnapshot();
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    claimTask: async (taskId: string) => {
      const repository = await resolveRepository();
      await repository.claimTask(taskId);
      mutateSharedData((current) => updateTaskState(current, taskId, "claimed"));
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    approveTaskApproval: async (taskAssignmentId: string) => {
      const repository = await resolveRepository();
      const taskApproval = snapshotState.data ? findApproval(snapshotState.data, taskAssignmentId) : null;
      await repository.approveTaskApproval(taskAssignmentId);
      mutateSharedData((current) => {
        let next = removeApproval(current, taskAssignmentId);

        if (taskApproval?.entityType === "task_assignment") {
          const matchingTask = next.tasks.find((task) => task.title === taskApproval.title);
          if (matchingTask) {
            next = updateTaskState(next, matchingTask.id, "approved");
          }
        }

        return next;
      });
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    rejectTaskApproval: async (taskAssignmentId: string) => {
      const repository = await resolveRepository();
      await repository.rejectTaskApproval(taskAssignmentId);
      mutateSharedData((current) => removeApproval(current, taskAssignmentId));
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    approveRewardApproval: async (rewardRedemptionId: string) => {
      const repository = await resolveRepository();
      const rewardApproval = snapshotState.data ? findApproval(snapshotState.data, rewardRedemptionId) : null;
      await repository.approveRewardApproval(rewardRedemptionId);
      mutateSharedData((current) => {
        let next = removeApproval(current, rewardRedemptionId);

        if (rewardApproval?.entityType === "reward_redemption") {
          const matchingReward = next.rewards.find((reward) => reward.title === rewardApproval.title);
          if (matchingReward) {
            next = updateRewardState(next, matchingReward.id, {
              redemptionId: rewardRedemptionId,
              redemptionStatus: "approved"
            });
          }
        }

        return next;
      });
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    rejectRewardApproval: async (rewardRedemptionId: string) => {
      const repository = await resolveRepository();
      const rewardApproval = snapshotState.data ? findApproval(snapshotState.data, rewardRedemptionId) : null;
      await repository.rejectRewardApproval(rewardRedemptionId);
      mutateSharedData((current) => {
        let next = removeApproval(current, rewardRedemptionId);

        if (rewardApproval?.entityType === "reward_redemption") {
          const matchingReward = next.rewards.find((reward) => reward.title === rewardApproval.title);
          if (matchingReward) {
            next = updateRewardState(next, matchingReward.id, {
              redemptionId: rewardRedemptionId,
              redemptionStatus: "rejected"
            });
          }
        }

        return next;
      });
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    redeemReward: async (rewardId: string) => {
      const repository = await resolveRepository();
      await repository.redeemReward(rewardId);
      mutateSharedData((current) =>
        updateRewardState(current, rewardId, {
          redemptionId: `pending-${rewardId}`,
          redemptionStatus: "requested"
        })
      );
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    fulfillRewardRedemption: async (rewardRedemptionId: string) => {
      const repository = await resolveRepository();
      await repository.fulfillRewardRedemption(rewardRedemptionId);
      mutateSharedData((current) => ({
        ...current,
        rewards: current.rewards.map((reward) =>
          reward.redemptionId === rewardRedemptionId ? { ...reward, redemptionStatus: "fulfilled" } : reward
        )
      }));
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    createFamilyMemberInvite: async (input) => {
      const repository = await resolveRepository();
      await repository.createFamilyMemberInvite(input);
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    createTask: async (input) => {
      const repository = await resolveRepository();
      await repository.createTask(input);
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    createReward: async (input) => {
      const repository = await resolveRepository();
      await repository.createReward(input);
      revalidateSharedSnapshot(repository);
      setHistoryPages(EMPTY_HISTORY_STATE);
    },
    historyPages,
    loadHistoryPage: async (entityType, options) => {
      const reset = options?.reset ?? false;
      const limit = options?.limit ?? 12;
      const currentPage = historyPages[entityType];
      const offset = reset ? 0 : currentPage.items.length;

      setHistoryPages((current) => ({
        ...current,
        [entityType]: {
          ...current[entityType],
          isLoading: true
        }
      }));

      try {
        const repository = await resolveRepository();
        const result = await repository.getHistoryPage({
          entityType,
          offset,
          limit
        });

        setHistoryPages((current) => ({
          ...current,
          [entityType]: {
            items: reset ? result.items : [...current[entityType].items, ...result.items],
            total: result.total,
            isLoading: false,
            isInitialized: true
          }
        }));
      } catch (error) {
        setHistoryPages((current) => ({
          ...current,
          [entityType]: {
            ...current[entityType],
            isLoading: false
          }
        }));
        throw error;
      }
    }
  };
}
