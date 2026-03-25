export type UserRole = "parent" | "child";

export type TaskStatus = "todo" | "claimed" | "approved";

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  role: UserRole;
}

export interface TaskDefinition {
  id: string;
  familyId: string;
  title: string;
  points: number;
  isActive: boolean;
}

export interface RewardDefinition {
  id: string;
  familyId: string;
  title: string;
  cost: number;
  isActive: boolean;
}

export interface ChildRecentWin {
  id: string;
  title: string;
  completedAtLabel: string;
  pointsEarned: number;
}

export interface ChildTask {
  id: string;
  title: string;
  points: number;
  icon: "bed" | "document-text" | "flower" | "checkmark-circle";
  state: "assigned" | "claimed" | "approved";
}

export interface StoreReward {
  id: string;
  title: string;
  cost: number;
  accentColor: string;
  icon: "tablet-portrait" | "moon" | "restaurant" | "bicycle";
  redemptionId?: string;
  redemptionStatus?: "requested" | "approved" | "rejected" | "fulfilled";
}

export interface ParentApproval {
  id: string;
  entityType: "task_assignment" | "reward_redemption";
  childMemberId: string;
  childDisplayName: string;
  sortTimestamp: string;
  title: string;
  subtitle: string;
  meta: string;
  tone: "yellow" | "blue";
}

export type HistoryEntityType = "task_assignment" | "reward_redemption";

export interface ParentHistoryItem {
  id: string;
  entityType: HistoryEntityType;
  childDisplayName: string;
  sortTimestamp: string;
  title: string;
  statusLabel: "approved" | "rejected" | "expired" | "missed" | "requested" | "fulfilled" | "assigned" | "claimed";
  meta: string;
  tone: "yellow" | "blue" | "green";
}

export interface ParentQuickAction {
  id: string;
  title: string;
  icon: "add-circle" | "cash" | "newspaper";
}

export interface FamilyChildOption {
  id: string;
  displayName: string;
  starsBalance: number;
  assignedTasks: number;
  claimedTasks: number;
  approvedTasks: number;
  approvedRewards: number;
  fulfilledRewards: number;
  approvedTodayPoints: number;
}

export interface FamilySnapshot {
  familyName: string;
  childName: string;
  childBalance: number;
  levelLabel: string;
  levelProgressCurrent: number;
  levelProgressTarget: number;
  nextLevelReward: string;
  todayGoalTitle: string;
  todayGoalEarned: number;
  todayGoalTarget: number;
  todayGoalReward: string;
  monthlyDistributed: number;
  monthlyTarget: number;
  monthlyRewardLabel: string;
  weeklyStreakDays: number;
  weeklyCompletedDayIndexes: number[];
}

export interface AppMockData {
  currentUserRole: UserRole;
  childMembers: FamilyChildOption[];
  snapshot: FamilySnapshot;
  recentWins: ChildRecentWin[];
  tasks: ChildTask[];
  rewards: StoreReward[];
  approvals: ParentApproval[];
  history: ParentHistoryItem[];
  parentActions: ParentQuickAction[];
}

export const mockAppData: AppMockData = {
  currentUserRole: "child",
  childMembers: [
    {
      id: "child-leo",
      displayName: "Leo",
      starsBalance: 125,
      assignedTasks: 3,
      claimedTasks: 1,
      approvedTasks: 2,
      approvedRewards: 1,
      fulfilledRewards: 1,
      approvedTodayPoints: 10
    }
  ],
  snapshot: {
    familyName: "KinderQuest",
    childName: "Leo",
    childBalance: 125,
    levelLabel: "Level 4 Explorer",
    levelProgressCurrent: 125,
    levelProgressTarget: 200,
    nextLevelReward: "Extra Screen Time",
    todayGoalTitle: "Pizza Party",
    todayGoalEarned: 75,
    todayGoalTarget: 125,
    todayGoalReward: "Pizza Party",
    monthlyDistributed: 840,
    monthlyTarget: 1000,
    monthlyRewardLabel: "Family Pizza Night",
    weeklyStreakDays: 5,
    weeklyCompletedDayIndexes: [0, 1, 2, 3, 4]
  },
  recentWins: [
    {
      id: "win-bed",
      title: "Made the Bed",
      completedAtLabel: "Today at 8:15 AM",
      pointsEarned: 10
    },
    {
      id: "win-reading",
      title: "30 Mins Reading",
      completedAtLabel: "Yesterday",
      pointsEarned: 25
    }
  ],
  tasks: [
    {
      id: "task-brush",
      title: "Brushed teeth",
      points: 10,
      icon: "bed",
      state: "assigned"
    },
    {
      id: "task-homework",
      title: "Finished homework",
      points: 20,
      icon: "document-text",
      state: "assigned"
    },
    {
      id: "task-share",
      title: "Shared toys",
      points: 5,
      icon: "flower",
      state: "assigned"
    },
    {
      id: "task-room",
      title: "Cleaned room",
      points: 0,
      icon: "checkmark-circle",
      state: "approved"
    }
  ],
  rewards: [
    {
      id: "reward-screen-time",
      title: "30 mins Screen Time",
      cost: 50,
      accentColor: "#fff1da",
      icon: "tablet-portrait"
    },
    {
      id: "reward-story",
      title: "Extra Bedtime Story",
      cost: 20,
      accentColor: "#ffe9de",
      icon: "moon",
      redemptionId: "reward-story-redemption",
      redemptionStatus: "approved"
    },
    {
      id: "reward-dinner",
      title: "Choose Dinner",
      cost: 100,
      accentColor: "#fff5cc",
      icon: "restaurant"
    },
    {
      id: "reward-weekend",
      title: "Choice of Weekend Activity",
      cost: 250,
      accentColor: "#fce6d9",
      icon: "bicycle"
    }
  ],
  approvals: [
    {
      id: "approval-cleanup",
      entityType: "task_assignment",
      childMemberId: "child-leo",
      childDisplayName: "Leo",
      sortTimestamp: new Date().toISOString(),
      title: "Toy Cleanup",
      subtitle: "Completed by Leo",
      meta: "10 mins ago",
      tone: "yellow"
    },
    {
      id: "approval-redemption",
      entityType: "reward_redemption",
      childMemberId: "child-leo",
      childDisplayName: "Leo",
      sortTimestamp: new Date(Date.now() - 60000).toISOString(),
      title: "Reward Redemption",
      subtitle: "Requested by Leo",
      meta: "\"Extra 30m Screen Time\"",
      tone: "blue"
    }
  ],
  history: [
    {
      id: "history-task-approved",
      entityType: "task_assignment",
      childDisplayName: "Leo",
      sortTimestamp: new Date().toISOString(),
      title: "Brush teeth morning",
      statusLabel: "approved",
      meta: "Today at 8:15 AM",
      tone: "green"
    },
    {
      id: "history-task-missed",
      entityType: "task_assignment",
      childDisplayName: "Leo",
      sortTimestamp: new Date(Date.now() - 86400000).toISOString(),
      title: "Put toys away",
      statusLabel: "missed",
      meta: "Yesterday",
      tone: "yellow"
    },
    {
      id: "history-reward-requested",
      entityType: "reward_redemption",
      childDisplayName: "Leo",
      sortTimestamp: new Date(Date.now() - 3600000).toISOString(),
      title: "Extra Bedtime Story",
      statusLabel: "requested",
      meta: "Today",
      tone: "blue"
    }
  ],
  parentActions: [
    {
      id: "action-behavior",
      title: "Add New Behavior",
      icon: "add-circle"
    },
    {
      id: "action-rewards",
      title: "Set Reward Values",
      icon: "cash"
    },
    {
      id: "action-history",
      title: "View All History",
      icon: "newspaper"
    }
  ]
};

export function getPendingTasksCount(data: AppMockData = mockAppData) {
  return data.tasks.filter((task) => task.state === "assigned").length;
}

export function getLevelProgressPercent(data: AppMockData = mockAppData) {
  return Math.round((data.snapshot.levelProgressCurrent / data.snapshot.levelProgressTarget) * 100);
}

export function getTodayGoalProgressPercent(data: AppMockData = mockAppData) {
  return Math.round((data.snapshot.todayGoalEarned / data.snapshot.todayGoalTarget) * 100);
}

export function getMonthlyProgressPercent(data: AppMockData = mockAppData) {
  return Math.round((data.snapshot.monthlyDistributed / data.snapshot.monthlyTarget) * 100);
}
