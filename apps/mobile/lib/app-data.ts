import { useEffect, useState } from "react";
import {
  type AppDataRepository,
  getAppSummary,
  mockRepository,
  SupabaseAppDataRepository
} from "@kinderquest/api";
import type { AppMockData, HistoryEntityType, ParentHistoryItem } from "@kinderquest/types";
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
  const [data, setData] = useState<AppMockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"mock" | "supabase">("mock");
  const [historyPages, setHistoryPages] = useState<Record<HistoryEntityType, HistoryPageState>>(EMPTY_HISTORY_STATE);

  async function resolveRepository(): Promise<AppDataRepository> {
    const env = getMobileSupabaseEnv();
    const client = getMobileSupabaseClient();
    return env && client ? new SupabaseAppDataRepository(client) : mockRepository;
  }

  async function load(repositoryOverride?: AppDataRepository) {
    const repository = repositoryOverride ?? (await resolveRepository());
    let next: AppMockData;

    try {
      next = await repository.getAppData();
      setSource(repository instanceof SupabaseAppDataRepository ? "supabase" : "mock");
      if (__DEV__) {
        console.info(`[app-data] source=${repository instanceof SupabaseAppDataRepository ? "supabase" : "mock"} loaded`);
      }
    } catch (error) {
      next = await mockRepository.getAppData();
      setSource("mock");
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

    setData(next);
    setIsLoading(false);
    setHistoryPages(EMPTY_HISTORY_STATE);
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await load();
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    isLoading,
    source,
    summary: data ? getAppSummary(data) : null,
    refresh: async () => {
      setIsLoading(true);
      await load();
    },
    claimTask: async (taskId: string) => {
      const repository = await resolveRepository();
      await repository.claimTask(taskId);
      await load(repository);
    },
    approveTaskApproval: async (taskAssignmentId: string) => {
      const repository = await resolveRepository();
      await repository.approveTaskApproval(taskAssignmentId);
      await load(repository);
    },
    rejectTaskApproval: async (taskAssignmentId: string) => {
      const repository = await resolveRepository();
      await repository.rejectTaskApproval(taskAssignmentId);
      await load(repository);
    },
    approveRewardApproval: async (rewardRedemptionId: string) => {
      const repository = await resolveRepository();
      await repository.approveRewardApproval(rewardRedemptionId);
      await load(repository);
    },
    rejectRewardApproval: async (rewardRedemptionId: string) => {
      const repository = await resolveRepository();
      await repository.rejectRewardApproval(rewardRedemptionId);
      await load(repository);
    },
    redeemReward: async (rewardId: string) => {
      const repository = await resolveRepository();
      await repository.redeemReward(rewardId);
      await load(repository);
    },
    fulfillRewardRedemption: async (rewardRedemptionId: string) => {
      const repository = await resolveRepository();
      await repository.fulfillRewardRedemption(rewardRedemptionId);
      await load(repository);
    },
    createFamilyMemberInvite: async (input) => {
      const repository = await resolveRepository();
      await repository.createFamilyMemberInvite(input);
      await load(repository);
    },
    createTask: async (input) => {
      const repository = await resolveRepository();
      await repository.createTask(input);
      await load(repository);
    },
    createReward: async (input) => {
      const repository = await resolveRepository();
      await repository.createReward(input);
      await load(repository);
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
