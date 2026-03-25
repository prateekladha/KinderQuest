import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  type ChildRecentWin,
  type ChildTask,
  type FamilyChildOption,
  type FamilySnapshot,
  type HistoryEntityType,
  type ParentApproval,
  type ParentHistoryItem,
  getLevelProgressPercent,
  getMonthlyProgressPercent,
  getPendingTasksCount,
  getTodayGoalProgressPercent,
  mockAppData,
  type AppMockData
} from "@kinderquest/types";

export interface AppDataRepository {
  getAppData(): Promise<AppMockData>;
  getHistoryPage(input: {
    entityType: HistoryEntityType;
    offset: number;
    limit: number;
  }): Promise<{
    items: ParentHistoryItem[];
    total: number;
  }>;
  claimTask(taskId: string): Promise<void>;
  approveTaskApproval(taskAssignmentId: string): Promise<void>;
  rejectTaskApproval(taskAssignmentId: string): Promise<void>;
  approveRewardApproval(rewardRedemptionId: string): Promise<void>;
  rejectRewardApproval(rewardRedemptionId: string): Promise<void>;
  redeemReward(rewardId: string): Promise<void>;
  fulfillRewardRedemption(rewardRedemptionId: string): Promise<void>;
  createFamilyMemberInvite(input: {
    email: string;
    displayName: string;
    role: "parent" | "child";
  }): Promise<void>;
  createTask(input: {
    title: string;
    description?: string;
    points: number;
  }): Promise<void>;
  createReward(input: {
    title: string;
    description?: string;
    cost: number;
  }): Promise<void>;
}

export class MockAppDataRepository implements AppDataRepository {
  async getAppData() {
    return mockAppData;
  }

  async getHistoryPage(input: {
    entityType: HistoryEntityType;
    offset: number;
    limit: number;
  }) {
    const filtered = mockAppData.history.filter((item) => item.entityType === input.entityType);
    return {
      items: filtered.slice(input.offset, input.offset + input.limit),
      total: filtered.length
    };
  }

  async claimTask(_taskId: string) {}

  async approveTaskApproval(_taskAssignmentId: string) {}

  async rejectTaskApproval(_taskAssignmentId: string) {}

  async approveRewardApproval(_rewardRedemptionId: string) {}

  async rejectRewardApproval(_rewardRedemptionId: string) {}

  async redeemReward(_rewardId: string) {}

  async fulfillRewardRedemption(_rewardRedemptionId: string) {}

  async createFamilyMemberInvite(_input: {
    email: string;
    displayName: string;
    role: "parent" | "child";
  }) {}

  async createTask(_input: {
    title: string;
    description?: string;
    points: number;
  }) {}

  async createReward(_input: {
    title: string;
    description?: string;
    cost: number;
  }) {}
}

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function createSupabaseClient(env: SupabaseEnv): SupabaseClient {
  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

interface FamilyMemberRow {
  id: string;
  family_id: string;
  display_name: string;
  role: "parent" | "child";
  stars_balance: number;
}

interface TaskAssignmentRow {
  id: string;
  status: "assigned" | "claimed" | "approved" | "rejected";
  points_awarded: number;
  task_definitions: {
    title: string;
  } | null;
}

interface RewardDefinitionRow {
  id: string;
  title: string;
  cost: number;
}

interface RewardStateRow {
  id: string;
  reward_definition_id: string;
  status: "requested" | "approved" | "rejected" | "fulfilled";
  requested_at: string;
  decided_at: string | null;
  fulfilled_at: string | null;
}

interface ChildMemberStatsRow {
  id: string;
  display_name: string;
  stars_balance: number;
}

interface FamilyUserRow {
  user_id: string | null;
}

interface TaskNotificationContextRow {
  id: string;
  family_id: string;
  child_member_id: string;
  family_members: { display_name: string } | null;
  task_definitions: { title: string } | null;
}

interface ClaimTaskResultRow {
  assignment_id: string;
  family_id: string;
  child_member_id: string;
  child_display_name: string;
  task_title: string | null;
  parent_user_ids: string[] | null;
}

interface ApproveTaskResultRow {
  assignment_id: string;
  family_id: string;
  child_member_id: string;
  child_user_id: string | null;
  task_title: string | null;
  points_awarded?: number;
}

interface RewardNotificationContextRow {
  id: string;
  family_id: string;
  child_member_id: string;
  family_members: { display_name: string } | null;
  reward_definitions: { title: string } | null;
}

interface RequestRewardResultRow {
  redemption_id: string;
  family_id: string;
  child_member_id: string;
  child_display_name: string;
  reward_title: string | null;
  reward_cost: number;
  parent_user_ids: string[] | null;
}

interface RewardDecisionResultRow {
  redemption_id: string;
  family_id: string;
  child_member_id: string;
  child_user_id: string | null;
  reward_title: string | null;
  reward_cost?: number;
}

interface FulfillRewardResultRow {
  redemption_id: string;
  family_id: string;
  child_member_id: string;
  child_display_name: string;
  reward_title: string | null;
  parent_user_ids: string[] | null;
}

interface RewardApprovalRow {
  id: string;
  requested_at: string;
  cost_at_redemption: number;
  child_member_id: string;
  family_members: { id: string; display_name: string } | null;
  reward_definitions: { title: string } | null;
}

interface HistoryTaskRow {
  id: string;
  status: TaskAssignmentRow["status"];
  assigned_for: string;
  approved_at: string | null;
  claimed_at: string | null;
  points_awarded: number;
  family_members: { display_name: string } | null;
  task_definitions: { title: string } | null;
}

interface HistoryRewardRow {
  id: string;
  status: "requested" | "approved" | "rejected" | "fulfilled";
  requested_at: string;
  decided_at: string | null;
  fulfilled_at: string | null;
  child_member_id: string;
  cost_at_redemption: number;
  family_members: { display_name: string } | null;
  reward_definitions: { title: string } | null;
}

interface RecentWinRow {
  id: string;
  approved_at: string | null;
  points_awarded: number;
  task_definitions: {
    title: string;
  } | null;
}

interface EarnedPointsRow {
  points_awarded: number;
}

interface WeeklyProgress {
  count: number;
  completedDayIndexes: number[];
}

export class SupabaseAppDataRepository implements AppDataRepository {
  private currentUserIdPromise: Promise<string | null> | null = null;
  private currentMemberByUserId = new Map<string, Promise<FamilyMemberRow | null>>();

  constructor(private readonly client: SupabaseClient) {}

  async getAppData(): Promise<AppMockData> {
    const userId = await this.getCurrentUserId();

    if (!userId) {
      return mockAppData;
    }

    const member = await this.getCurrentMember(userId);

    if (!member) {
      return mockAppData;
    }

    if (member.role === "parent") {
      return this.getParentAppData(member);
    }

    return this.getChildAppData(member);
  }

  async getHistoryPage(input: {
    entityType: HistoryEntityType;
    offset: number;
    limit: number;
  }): Promise<{ items: ParentHistoryItem[]; total: number }> {
    const userId = await this.requireUserId();
    const member = await this.getCurrentMember(userId);

    if (!member) {
      throw new Error("No family member found for current user.");
    }

    if (member.role !== "parent") {
      throw new Error("Only parents can view history.");
    }

    return this.getHistoryPageForFamily(member.family_id, input);
  }

  async claimTask(taskId: string): Promise<void> {
    const result = await this.client
      .rpc("claim_task_assignment", {
        target_assignment_id: taskId
      })
      .single<ClaimTaskResultRow>();

    if (result.error) {
      console.info(`[claim] rpc-error=${JSON.stringify(result.error)}`);
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.parent_user_ids ?? [],
        title: "Task claimed",
        body: `${result.data.child_display_name} claimed ${result.data.task_title ?? "a task"}.`,
        data: {
          type: "task_claimed",
          taskAssignmentId: taskId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async approveTaskApproval(taskAssignmentId: string): Promise<void> {
    const result = await this.client.rpc("approve_task_assignment", {
      target_assignment_id: taskAssignmentId
    }).single<ApproveTaskResultRow>();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.child_user_id ? [result.data.child_user_id] : [],
        title: "Task approved",
        body: `Your parent approved ${result.data.task_title ?? "your task"}.`,
        data: {
          type: "task_approved",
          taskAssignmentId: taskAssignmentId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async rejectTaskApproval(taskAssignmentId: string): Promise<void> {
    const result = await this.client.rpc("reject_task_assignment", {
      target_assignment_id: taskAssignmentId
    }).single<ApproveTaskResultRow>();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.child_user_id ? [result.data.child_user_id] : [],
        title: "Task rejected",
        body: `Your parent rejected ${result.data.task_title ?? "your task"}.`,
        data: {
          type: "task_rejected",
          taskAssignmentId: taskAssignmentId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async approveRewardApproval(rewardRedemptionId: string): Promise<void> {
    const result = await this.client.rpc("approve_reward_redemption", {
      target_redemption_id: rewardRedemptionId
    }).single<RewardDecisionResultRow>();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.child_user_id ? [result.data.child_user_id] : [],
        title: "Reward approved",
        body: `Your parent approved ${result.data.reward_title ?? "your reward"}.`,
        data: {
          type: "reward_approved",
          rewardRedemptionId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async rejectRewardApproval(rewardRedemptionId: string): Promise<void> {
    const result = await this.client.rpc("reject_reward_redemption", {
      target_redemption_id: rewardRedemptionId
    }).single<RewardDecisionResultRow>();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.child_user_id ? [result.data.child_user_id] : [],
        title: "Reward rejected",
        body: `Your parent rejected ${result.data.reward_title ?? "your reward"}.`,
        data: {
          type: "reward_rejected",
          rewardRedemptionId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async redeemReward(rewardId: string): Promise<void> {
    const result = await this.client.rpc("request_reward_redemption", {
      target_reward_id: rewardId
    }).single<RequestRewardResultRow>();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.parent_user_ids ?? [],
        title: "Reward requested",
        body: `${result.data.child_display_name} requested ${result.data.reward_title ?? "a reward"}.`,
        data: {
          type: "reward_requested",
          rewardDefinitionId: rewardId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async fulfillRewardRedemption(rewardRedemptionId: string): Promise<void> {
    const result = await this.client.rpc("fulfill_reward_redemption", {
      target_redemption_id: rewardRedemptionId
    }).single<FulfillRewardResultRow>();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      await this.sendPushNotificationSafely({
        recipientUserIds: result.data.parent_user_ids ?? [],
        title: "Reward fulfilled",
        body: `${result.data.child_display_name} marked ${result.data.reward_title ?? "a reward"} as fulfilled.`,
        data: {
          type: "reward_fulfilled",
          rewardRedemptionId,
          childMemberId: result.data.child_member_id
        }
      });
    }
  }

  async createFamilyMemberInvite(input: {
    email: string;
    displayName: string;
    role: "parent" | "child";
  }): Promise<void> {
    const userId = await this.requireUserId();
    const member = await this.getCurrentMember(userId);

    if (!member) {
      throw new Error("No family member found for current user.");
    }

    if (member.role !== "parent") {
      throw new Error("Only parents can add family members.");
    }

    const { error } = await this.client.from("family_member_invites").insert({
      family_id: member.family_id,
      invited_by: userId,
      email: input.email.trim().toLowerCase(),
      display_name: input.displayName.trim(),
      role: input.role
    });

    if (error) {
      throw error;
    }
  }

  async createTask(input: {
    title: string;
    description?: string;
    points: number;
    childMemberId?: string;
  }): Promise<void> {
    const userId = await this.requireUserId();
    const member = await this.getCurrentMember(userId);

    if (!member) {
      throw new Error("No family member found for current user.");
    }

    if (member.role !== "parent") {
      throw new Error("Only parents can create tasks.");
    }

    const definitionInsert = await this.client.from("task_definitions").insert({
      family_id: member.family_id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      points: input.points,
      cadence: "daily",
      created_by: userId
    }).select("id, family_id, points").single<{ id: string; family_id: string; points: number }>();

    if (definitionInsert.error) {
      throw definitionInsert.error;
    }

    if (input.childMemberId) {
      const today = new Date().toISOString().slice(0, 10);
      const assignmentInsert = await this.client.from("task_assignments").insert({
        family_id: definitionInsert.data.family_id,
        task_definition_id: definitionInsert.data.id,
        child_member_id: input.childMemberId,
        assigned_for: today,
        points_awarded: definitionInsert.data.points
      });

      if (assignmentInsert.error) {
        throw assignmentInsert.error;
      }
    }
  }

  async createReward(input: {
    title: string;
    description?: string;
    cost: number;
  }): Promise<void> {
    const userId = await this.requireUserId();
    const member = await this.getCurrentMember(userId);

    if (!member) {
      throw new Error("No family member found for current user.");
    }

    if (member.role !== "parent") {
      throw new Error("Only parents can create rewards.");
    }

    const { error } = await this.client.from("reward_definitions").insert({
      family_id: member.family_id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      cost: input.cost,
      created_by: userId
    });

    if (error) {
      throw error;
    }
  }

  private async sendPushNotificationSafely(input: {
    recipientUserIds: string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    if (input.recipientUserIds.length === 0) {
      return;
    }

    try {
      const { error } = await this.client.functions.invoke("send-push", {
        body: input
      });

      if (error) {
        console.info(`[notifications] send-error=${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.info(
        `[notifications] send-error=${
          error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error)
        }`
      );
    }
  }

  private async getCurrentMember(userId: string) {
    const cached = this.currentMemberByUserId.get(userId);
    if (cached) {
      return cached;
    }

    const promise = (async () => {
      const { data, error } = await this.client
        .from("family_members")
        .select("id, family_id, display_name, role, stars_balance")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle<FamilyMemberRow>();

      if (error) {
        throw error;
      }

      return data;
    })();

    this.currentMemberByUserId.set(userId, promise);
    return promise;
  }

  private async getFirstChildMember(familyId: string) {
    const { data, error } = await this.client
      .from("family_members")
      .select("id, family_id, display_name, role, stars_balance")
      .eq("family_id", familyId)
      .eq("role", "child")
      .limit(1)
      .maybeSingle<FamilyMemberRow>();

    if (error) {
      throw error;
    }

    return data;
  }

  private async getParentAppData(member: FamilyMemberRow): Promise<AppMockData> {
    const [childMembers, approvals, rewards] = await Promise.all([
      this.getChildMembers(member.family_id),
      this.getPendingApprovals(member.family_id),
      this.getActiveRewards(member.family_id)
    ]);

    return {
      ...mockAppData,
      currentUserRole: "parent",
      childMembers,
      snapshot: buildParentBootstrapSnapshot(member),
      recentWins: [],
      tasks: [],
      rewards,
      approvals,
      history: []
    };
  }

  private async getChildAppData(member: FamilyMemberRow): Promise<AppMockData> {
    const [tasks, rewards, childMembers, recentWins, weeklyProgress, totalEarnedPoints] = await Promise.all([
      this.getTodayTasks(member.id),
      this.getRewards(member.family_id, member.id),
      this.getChildMembers(member.family_id),
      this.getRecentWins(member.id),
      this.getCurrentWeekProgress(member.id),
      this.getTotalEarnedPoints(member.id)
    ]);

    const snapshot = buildLiveSnapshot(member, tasks, rewards, weeklyProgress, totalEarnedPoints);

    return {
      ...mockAppData,
      currentUserRole: "child",
      childMembers,
      snapshot,
      recentWins,
      tasks,
      rewards,
      approvals: [],
      history: []
    };
  }

  private async getTodayTasks(childMemberId: string): Promise<ChildTask[]> {
    await this.ensureTodayAssignments(childMemberId);

    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await this.client
      .from("task_assignments")
      .select("id, status, points_awarded, task_definitions(title)")
      .eq("child_member_id", childMemberId)
      .eq("assigned_for", today)
      .returns<TaskAssignmentRow[]>();

    if (error) {
      console.info(`[claim] load-tasks-error=${JSON.stringify(error)}`);
      throw error;
    }

    console.info(`[claim] loaded-task-rows=${JSON.stringify(data ?? [])}`);

    return (data ?? []).map((task, index) => ({
      id: task.id,
      title: task.task_definitions?.title ?? `Task ${index + 1}`,
      points: task.points_awarded,
      icon: mapTaskIcon(task.task_definitions?.title ?? ""),
      state: mapTaskState(task.status)
    }));
  }

  private async getPendingApprovals(familyId: string): Promise<ParentApproval[]> {
    const taskApprovalsResult = await this.client
      .from("task_assignments")
      .select("id, claimed_at, points_awarded, child_member_id, family_members!task_assignments_child_member_id_fkey(id, display_name), task_definitions(title)")
      .eq("family_id", familyId)
      .eq("status", "claimed")
      .order("claimed_at", { ascending: false })
      .returns<Array<{
        id: string;
        claimed_at: string | null;
        child_member_id: string;
        points_awarded: number;
        family_members: { id: string; display_name: string } | null;
        task_definitions: { title: string } | null;
      }>>();

    if (taskApprovalsResult.error) {
      throw taskApprovalsResult.error;
    }

    const rewardApprovalsResult = await this.client
      .from("reward_redemptions")
      .select("id, requested_at, cost_at_redemption, child_member_id, family_members!reward_redemptions_child_member_id_fkey(id, display_name), reward_definitions(title)")
      .eq("family_id", familyId)
      .eq("status", "requested")
      .order("requested_at", { ascending: false })
      .returns<RewardApprovalRow[]>();

    if (rewardApprovalsResult.error) {
      throw rewardApprovalsResult.error;
    }

    const taskApprovals = (taskApprovalsResult.data ?? []).map((approval, index) => ({
      sortAt: approval.claimed_at ?? "",
      item: {
        id: approval.id,
        entityType: "task_assignment",
        childMemberId: approval.child_member_id,
        childDisplayName: approval.family_members?.display_name ?? "Child",
        sortTimestamp: approval.claimed_at ?? "",
        title: approval.task_definitions?.title ?? `Task ${index + 1}`,
        subtitle: `Completed by ${approval.family_members?.display_name ?? "Child"}`,
        meta: formatMetaWithStars(approval.points_awarded, approval.claimed_at ?? ""),
        tone: "yellow"
      } satisfies ParentApproval
    }));

    const rewardApprovals = (rewardApprovalsResult.data ?? []).map((approval, index) => ({
      sortAt: approval.requested_at,
      item: {
        id: approval.id,
        entityType: "reward_redemption",
        childMemberId: approval.child_member_id,
        childDisplayName: approval.family_members?.display_name ?? "Child",
        sortTimestamp: approval.requested_at,
        title: approval.reward_definitions?.title ?? `Reward ${index + 1}`,
        subtitle: `Requested by ${approval.family_members?.display_name ?? "Child"}`,
        meta: formatMetaWithStars(approval.cost_at_redemption, approval.requested_at),
        tone: "blue"
      } satisfies ParentApproval
    }));

    return [...taskApprovals, ...rewardApprovals]
      .sort((left, right) => getSortTimestamp(right.sortAt) - getSortTimestamp(left.sortAt))
      .map((entry) => entry.item);
  }

  private async getHistoryPageForFamily(
    familyId: string,
    input: {
      entityType: HistoryEntityType;
      offset: number;
      limit: number;
    }
  ): Promise<{ items: ParentHistoryItem[]; total: number }> {
    if (input.entityType === "task_assignment") {
      return this.getTaskHistoryPage(familyId, input.offset, input.limit);
    }

    return this.getRewardHistoryPage(familyId, input.offset, input.limit);
  }

  private async getTaskHistoryPage(
    familyId: string,
    offset: number,
    limit: number
  ): Promise<{ items: ParentHistoryItem[]; total: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const taskHistoryResult = await this.client
      .from("task_assignments")
      .select(
        "id, status, assigned_for, approved_at, claimed_at, points_awarded, family_members!task_assignments_child_member_id_fkey(display_name), task_definitions(title)",
        { count: "exact" }
      )
      .eq("family_id", familyId)
      .or(`status.in.(approved,rejected),and(status.eq.claimed,assigned_for.lt.${today})`)
      .order("assigned_for", { ascending: false })
      .range(offset, offset + limit - 1)
      .returns<HistoryTaskRow[]>();

    if (taskHistoryResult.error) {
      throw taskHistoryResult.error;
    }

    const items = (taskHistoryResult.data ?? []).map((item, index) => ({
      id: item.id,
      entityType: "task_assignment",
      childDisplayName: item.family_members?.display_name ?? "Child",
      sortTimestamp: item.approved_at ?? item.claimed_at ?? item.assigned_for,
      title: item.task_definitions?.title ?? `Task ${offset + index + 1}`,
      statusLabel: deriveTaskHistoryStatus(item.status, item.assigned_for, today),
      meta: formatMetaWithStars(item.points_awarded, getTaskHistoryTimestamp(item)),
      tone: item.status === "approved" ? "green" : item.status === "rejected" ? "yellow" : "blue"
    })) satisfies ParentHistoryItem[];

    return {
      items,
      total: taskHistoryResult.count ?? items.length
    };
  }

  private async getRewardHistoryPage(
    familyId: string,
    offset: number,
    limit: number
  ): Promise<{ items: ParentHistoryItem[]; total: number }> {
    const rewardHistoryResult = await this.client
      .from("reward_redemptions")
      .select(
        "id, status, requested_at, decided_at, fulfilled_at, child_member_id, cost_at_redemption, family_members!reward_redemptions_child_member_id_fkey(display_name), reward_definitions(title)",
        { count: "exact" }
      )
      .eq("family_id", familyId)
      .in("status", ["approved", "rejected", "fulfilled"])
      .order("fulfilled_at", { ascending: false, nullsFirst: false })
      .order("decided_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)
      .returns<HistoryRewardRow[]>();

    if (rewardHistoryResult.error) {
      throw rewardHistoryResult.error;
    }

    const items = (rewardHistoryResult.data ?? []).map((item, index) => ({
      id: item.id,
      entityType: "reward_redemption",
      childDisplayName: item.family_members?.display_name ?? "Child",
      sortTimestamp: item.fulfilled_at ?? item.decided_at ?? item.requested_at,
      title: item.reward_definitions?.title ?? `Reward ${offset + index + 1}`,
      statusLabel: item.status,
      meta: formatMetaWithStars(item.cost_at_redemption, item.fulfilled_at ?? item.decided_at ?? item.requested_at),
      tone: item.status === "approved" || item.status === "fulfilled" ? "green" : "yellow"
    })) satisfies ParentHistoryItem[];

    return {
      items,
      total: rewardHistoryResult.count ?? items.length
    };
  }

  private async getRewards(familyId: string, childMemberId: string) {
    const rewardsResult = await this.client
      .from("reward_definitions")
      .select("id, title, cost")
      .eq("family_id", familyId)
      .eq("is_active", true)
      .order("cost", { ascending: true })
      .returns<RewardDefinitionRow[]>();

    if (rewardsResult.error) {
      throw rewardsResult.error;
    }

    const rewardStateResult = await this.client
      .from("reward_redemptions")
      .select("id, reward_definition_id, status, requested_at, decided_at, fulfilled_at")
      .eq("child_member_id", childMemberId)
      .in("status", ["requested", "approved", "fulfilled"])
      .order("requested_at", { ascending: false })
      .returns<RewardStateRow[]>();

    if (rewardStateResult.error) {
      throw rewardStateResult.error;
    }

    const rewardStateByDefinitionId = new Map<string, RewardStateRow>();

    for (const rewardState of rewardStateResult.data ?? []) {
      if (!rewardStateByDefinitionId.has(rewardState.reward_definition_id)) {
        rewardStateByDefinitionId.set(rewardState.reward_definition_id, rewardState);
      }
    }

    return (rewardsResult.data ?? []).map((reward, index) => {
      const rewardState = rewardStateByDefinitionId.get(reward.id);

      return {
        id: reward.id,
        title: reward.title,
        cost: reward.cost,
        accentColor: rewardCardColors[index % rewardCardColors.length],
        icon: mapRewardIcon(reward.title),
        redemptionId: rewardState?.id,
        redemptionStatus: rewardState?.status
      };
    });
  }

  private async getActiveRewards(familyId: string) {
    const rewardsResult = await this.client
      .from("reward_definitions")
      .select("id, title, cost")
      .eq("family_id", familyId)
      .eq("is_active", true)
      .order("cost", { ascending: true })
      .returns<RewardDefinitionRow[]>();

    if (rewardsResult.error) {
      throw rewardsResult.error;
    }

    return (rewardsResult.data ?? []).map((reward, index) => ({
      id: reward.id,
      title: reward.title,
      cost: reward.cost,
      accentColor: rewardCardColors[index % rewardCardColors.length],
      icon: mapRewardIcon(reward.title)
    }));
  }

  private async getRecentWins(childMemberId: string): Promise<ChildRecentWin[]> {
    const { data, error } = await this.client
      .from("task_assignments")
      .select("id, approved_at, points_awarded, task_definitions(title)")
      .eq("child_member_id", childMemberId)
      .eq("status", "approved")
      .order("approved_at", { ascending: false })
      .limit(5)
      .returns<RecentWinRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).map((win, index) => ({
      id: win.id,
      title: win.task_definitions?.title ?? `Win ${index + 1}`,
      completedAtLabel: win.approved_at ? formatRecentWinLabel(win.approved_at) : "Approved",
      pointsEarned: win.points_awarded
    }));
  }

  private async getCurrentWeekProgress(childMemberId: string): Promise<WeeklyProgress> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    const mondayKey = monday.toISOString().slice(0, 10);

    const { data, error } = await this.client
      .from("task_assignments")
      .select("assigned_for")
      .eq("child_member_id", childMemberId)
      .eq("status", "approved")
      .gte("assigned_for", mondayKey)
      .order("assigned_for", { ascending: true })
      .returns<Array<{ assigned_for: string }>>();

    if (error) {
      throw error;
    }

    const completedDayIndexes = Array.from(
      new Set(
        (data ?? []).map((row) => {
          const rowDate = new Date(`${row.assigned_for}T00:00:00`);
          const rowDay = rowDate.getDay();
          return rowDay === 0 ? 6 : rowDay - 1;
        })
      )
    ).sort((left, right) => left - right);

    return {
      count: completedDayIndexes.length,
      completedDayIndexes
    };
  }

  private async getTotalEarnedPoints(childMemberId: string) {
    const { data, error } = await this.client
      .from("task_assignments")
      .select("points_awarded")
      .eq("child_member_id", childMemberId)
      .eq("status", "approved")
      .returns<EarnedPointsRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).reduce((sum, row) => sum + row.points_awarded, 0);
  }

  private async getChildMembers(familyId: string): Promise<FamilyChildOption[]> {
    const { data, error } = await this.client
      .from("family_members")
      .select("id, display_name, stars_balance")
      .eq("family_id", familyId)
      .eq("role", "child")
      .order("display_name", { ascending: true })
      .returns<ChildMemberStatsRow[]>();

    if (error) {
      throw error;
    }

    const children = data ?? [];

    if (children.length === 0) {
      return [];
    }

    await Promise.all(children.map(async (child) => {
      await this.ensureTodayAssignments(child.id);
    }));

    const today = new Date().toISOString().slice(0, 10);
    const assignmentsResult = await this.client
      .from("task_assignments")
      .select("child_member_id, status, points_awarded")
      .in("child_member_id", children.map((child) => child.id))
      .eq("assigned_for", today)
      .returns<Array<{ child_member_id: string; status: TaskAssignmentRow["status"]; points_awarded: number }>>();

    if (assignmentsResult.error) {
      throw assignmentsResult.error;
    }

    const rewardStatsResult = await this.client
      .from("reward_redemptions")
      .select("child_member_id, status")
      .in("child_member_id", children.map((child) => child.id))
      .in("status", ["approved", "fulfilled"])
      .returns<Array<{ child_member_id: string; status: HistoryRewardRow["status"] }>>();

    if (rewardStatsResult.error) {
      throw rewardStatsResult.error;
    }

    const statsByChildId = new Map<string, { assignedTasks: number; claimedTasks: number; approvedTasks: number; approvedRewards: number; fulfilledRewards: number; approvedTodayPoints: number }>();

    for (const assignment of assignmentsResult.data ?? []) {
      const stats = statsByChildId.get(assignment.child_member_id) ?? {
        assignedTasks: 0,
        claimedTasks: 0,
        approvedTasks: 0,
        approvedRewards: 0,
        fulfilledRewards: 0,
        approvedTodayPoints: 0
      };

      if (assignment.status === "assigned") {
        stats.assignedTasks += 1;
      }

      if (assignment.status === "claimed") {
        stats.claimedTasks += 1;
      }

      if (assignment.status === "approved") {
        stats.approvedTasks += 1;
        stats.approvedTodayPoints += assignment.points_awarded;
      }

      statsByChildId.set(assignment.child_member_id, stats);
    }

    for (const reward of rewardStatsResult.data ?? []) {
      const stats = statsByChildId.get(reward.child_member_id) ?? {
        assignedTasks: 0,
        claimedTasks: 0,
        approvedTasks: 0,
        approvedRewards: 0,
        fulfilledRewards: 0,
        approvedTodayPoints: 0
      };

      if (reward.status === "approved") {
        stats.approvedRewards += 1;
      }

      if (reward.status === "fulfilled") {
        stats.fulfilledRewards += 1;
      }
      statsByChildId.set(reward.child_member_id, stats);
    }

    return children.map((member) => {
      const stats = statsByChildId.get(member.id) ?? {
        assignedTasks: 0,
        claimedTasks: 0,
        approvedTasks: 0,
        approvedRewards: 0,
        fulfilledRewards: 0,
        approvedTodayPoints: 0
      };

      return {
        id: member.id,
        displayName: member.display_name,
        starsBalance: member.stars_balance,
        assignedTasks: stats.assignedTasks,
        claimedTasks: stats.claimedTasks,
        approvedTasks: stats.approvedTasks,
        approvedRewards: stats.approvedRewards,
        fulfilledRewards: stats.fulfilledRewards,
        approvedTodayPoints: stats.approvedTodayPoints
      };
    });
  }

  private async requireUserId() {
    const userId = await this.getCurrentUserId();

    if (!userId) {
      throw new Error("No active Supabase user session.");
    }

    return userId;
  }

  private async getCurrentUserId() {
    if (!this.currentUserIdPromise) {
      this.currentUserIdPromise = this.client.auth
        .getSession()
        .then((result) => result.data.session?.user?.id ?? null);
    }

    return this.currentUserIdPromise;
  }

  private async ensureTodayAssignments(childMemberId: string) {
    const { error } = await this.client.rpc("ensure_today_task_assignments", {
      target_child_member_id: childMemberId
    });

    if (error) {
      const message = typeof error.message === "string" ? error.message : "";
      if (message.includes("Could not find the function public.ensure_today_task_assignments")) {
        return;
      }

      throw error;
    }
  }
}

export function getAppSummary(data: AppMockData) {
  return {
    pendingTasks: getPendingTasksCount(data),
    levelPercent: getLevelProgressPercent(data),
    todayGoalPercent: getTodayGoalProgressPercent(data),
    monthlyPercent: getMonthlyProgressPercent(data)
  };
}

export const mockRepository = new MockAppDataRepository();

function mapTaskIcon(title: string): ChildTask["icon"] {
  const normalized = title.toLowerCase();

  if (normalized.includes("homework") || normalized.includes("read")) {
    return "document-text";
  }

  if (normalized.includes("share") || normalized.includes("toy")) {
    return "flower";
  }

  if (normalized.includes("clean") || normalized.includes("room")) {
    return "checkmark-circle";
  }

  return "bed";
}

function buildLiveSnapshot(
  member: FamilyMemberRow,
  tasks: ChildTask[],
  rewards: AppMockData["rewards"],
  weeklyProgress: WeeklyProgress,
  totalEarnedPoints: number
): FamilySnapshot {
  const completedPoints = tasks.filter((task) => task.state === "approved").reduce((sum, task) => sum + task.points, 0);
  const todayTarget = Math.max(50, tasks.reduce((sum, task) => sum + task.points, 0));
  const level = Math.max(1, Math.floor(totalEarnedPoints / 100) + 1);
  const levelTarget = level * 100;
  const nextReward = rewards.find((reward) => reward.cost > member.stars_balance) ?? rewards[0];

  return {
    familyName: "KinderQuest Family",
    childName: member.display_name,
    childBalance: member.stars_balance,
    levelLabel: `Level ${level} Explorer`,
    levelProgressCurrent: totalEarnedPoints,
    levelProgressTarget: levelTarget,
    nextLevelReward: nextReward?.title ?? "New family reward",
    todayGoalTitle: "Daily Goal",
    todayGoalEarned: completedPoints,
    todayGoalTarget: todayTarget,
    todayGoalReward: nextReward?.title ?? "New family reward",
    monthlyDistributed: member.stars_balance,
    monthlyTarget: Math.max(200, levelTarget * 2),
    monthlyRewardLabel: nextReward?.title ?? "New family reward",
    weeklyStreakDays: weeklyProgress.count,
    weeklyCompletedDayIndexes: weeklyProgress.completedDayIndexes
  };
}

function buildParentBootstrapSnapshot(member: FamilyMemberRow): FamilySnapshot {
  return {
    familyName: "KinderQuest Family",
    childName: member.display_name,
    childBalance: member.stars_balance,
    levelLabel: "Family Setup",
    levelProgressCurrent: 0,
    levelProgressTarget: 100,
    nextLevelReward: "Add your first child",
    todayGoalTitle: "Get Started",
    todayGoalEarned: 0,
    todayGoalTarget: 100,
    todayGoalReward: "Create your first routine",
    monthlyDistributed: 0,
    monthlyTarget: 200,
    monthlyRewardLabel: "First family reward",
    weeklyStreakDays: 0,
    weeklyCompletedDayIndexes: []
  };
}

const rewardCardColors = ["#fff1da", "#ffe9de", "#fff5cc", "#fce6d9"] as const;

function mapTaskState(status: TaskAssignmentRow["status"]): ChildTask["state"] {
  if (status === "approved") {
    return "approved";
  }

  if (status === "claimed") {
    return "claimed";
  }

  return "assigned";
}

function formatRelativeTime(value: string) {
  const time = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - time) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day ago`;
}

function deriveTaskHistoryStatus(status: TaskAssignmentRow["status"], assignedFor: string, today: string): ParentHistoryItem["statusLabel"] {
  if (status === "approved") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  if (status === "claimed") {
    return assignedFor < today ? "missed" : "claimed";
  }

  return assignedFor < today ? "expired" : "assigned";
}

function isHistoricalTaskRow(item: HistoryTaskRow, today: string) {
  if (item.status === "approved" || item.status === "rejected") {
    return true;
  }

  return item.assigned_for < today;
}

function getSortTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getTaskHistoryTimestamp(item: HistoryTaskRow) {
  if (item.approved_at) {
    return item.approved_at;
  }

  if (item.claimed_at) {
    return item.claimed_at;
  }

  return item.assigned_for;
}

function formatMetaWithStars(stars: number, timestamp: string) {
  const timeLabel = formatRelativeTime(timestamp);
  return `${stars} stars • ${timeLabel}`;
}

function formatRecentWinLabel(value: string) {
  const date = new Date(value);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function mapRewardIcon(title: string): AppMockData["rewards"][number]["icon"] {
  const normalized = title.toLowerCase();

  if (normalized.includes("story") || normalized.includes("bedtime") || normalized.includes("sleep")) {
    return "moon";
  }

  if (normalized.includes("dinner") || normalized.includes("dessert") || normalized.includes("treat")) {
    return "restaurant";
  }

  if (normalized.includes("park") || normalized.includes("bike") || normalized.includes("outing")) {
    return "bicycle";
  }

  return "tablet-portrait";
}
