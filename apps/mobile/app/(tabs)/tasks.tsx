import { useEffect, useState } from "react";
import { Redirect, usePathname } from "expo-router";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { ActionButton, GradientHero, Pill, SurfaceCard } from "../../components/cards";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useToast } from "../../components/toast-provider";
import { useAppData } from "../../lib/app-data";

export default function TasksScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const pathname = usePathname();
  const { data, isLoading, source, summary, claimTask, refresh } = useAppData();
  const { showToast } = useToast();
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const isParentView = data?.currentUserRole === "parent";

  useEffect(() => {
    if (pathname === "/tasks" && !isLoading) {
      void refresh();
    }
  }, [pathname]);

  if (isLoading || !data || !summary) {
    return <LoadingState />;
  }

  if (data.currentUserRole === "parent") {
    return <Redirect href="/(tabs)/approvals" />;
  }

  const featuredReward = data.rewards[data.rewards.length - 1] ?? null;

  async function handleClaimTask(taskId: string) {
    setPendingTaskId(taskId);

    if (source !== "supabase") {
      if (__DEV__) {
        console.info(`[claim-ui] blocked source=${source} taskId=${taskId}`);
      }
      showToast("Task actions are unavailable until live family data loads.", "error");
      setPendingTaskId(null);
      return;
    }

    if (isParentView) {
      if (__DEV__) {
        console.info(`[claim-ui] blocked role=parent taskId=${taskId}`);
      }
      showToast("Switch to a child account to claim tasks.", "error");
      setPendingTaskId(null);
      return;
    }

    try {
      if (__DEV__) {
        console.info(`[claim-ui] attempt taskId=${taskId}`);
      }
      await claimTask(taskId);
      showToast("Task claimed. Waiting for parent approval.");
    } catch (nextError) {
      if (__DEV__) {
        console.info(`[claim-ui] error=${getErrorMessage(nextError, "unknown")}`);
      }
      showToast(getErrorMessage(nextError, "Could not claim task right now."), "error");
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <ScreenShell
      headerRight={<Pill label={`${summary.pendingTasks} Tasks Left`} tone="blue" />}
      subtitle="Points & Rewards"
      title="Today's Missions"
    >
      <GradientHero
        subtitle={`Earn ${
          data.snapshot.todayGoalTarget - data.snapshot.todayGoalEarned
        } more stars to unlock a ${data.snapshot.todayGoalReward}.`}
        title="Today's Goal"
      >
        <View style={styles.goalProgress}>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${summary.todayGoalPercent}%` }]} />
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalMeta}>{data.snapshot.todayGoalEarned} stars earned</Text>
            <Text style={styles.goalMeta}>{data.snapshot.todayGoalTarget} stars goal</Text>
          </View>
        </View>
      </GradientHero>

      <SectionHeading title="Daily Missions" />
      {data.tasks.length === 0 ? (
        <SurfaceCard tone="white">
          <Text style={styles.emptyTitle}>No tasks available yet</Text>
          <Text style={styles.emptyBody}>
            Ask a parent to add tasks for this child account before claiming points here.
          </Text>
        </SurfaceCard>
      ) : (
        <View style={[styles.taskGrid, isTablet && styles.taskGridTablet]}>
          {data.tasks.map((task) => {
            const isApproved = task.state === "approved";
            const isClaimed = task.state === "claimed";
            const isAssigned = task.state === "assigned";
            const isLiveTask = isUuid(task.id);
            const buttonLabel = isApproved
              ? "Done"
              : isClaimed
                ? "Pending"
                : isParentView
                  ? "Child Only"
                  : source !== "supabase" || !isLiveTask
                    ? "Unavailable"
                    : pendingTaskId === task.id
                      ? "Claiming..."
                      : "Claim";
            const taskSubtitle = isApproved
              ? "Approved"
              : isClaimed
                ? "Awaiting parent approval"
                : `${task.points} pts`;

            return (
              <SurfaceCard key={task.id} tone={isApproved ? "green" : "white"}>
                <View style={styles.taskRow}>
                  <View style={styles.taskMeta}>
                    <View style={[styles.taskIcon, isApproved && styles.taskIconDone, isClaimed && styles.taskIconClaimed]}>
                      <Ionicons
                        color={isApproved ? tokens.color.success : isClaimed ? tokens.color.tertiary : tokens.color.secondary}
                        name={task.icon}
                        size={20}
                      />
                    </View>
                    <View style={styles.taskCopy}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskPoints}>{taskSubtitle}</Text>
                    </View>
                  </View>
                  <ActionButton
                    label={buttonLabel}
                    onPress={isAssigned && !isParentView && source === "supabase" && isLiveTask ? () => void handleClaimTask(task.id) : undefined}
                    quiet={!isAssigned || isParentView || source !== "supabase" || !isLiveTask}
                  />
                </View>
              </SurfaceCard>
            );
          })}
        </View>
      )}

      <View style={[styles.taskGrid, isTablet && styles.taskGridTablet]}>
        <SurfaceCard tone="white">
          <Text style={styles.streakTitle}>This Week</Text>
          <Text style={styles.streakBody}>
            {data.snapshot.weeklyStreakDays > 0
              ? `You've finished tasks on ${data.snapshot.weeklyStreakDays} day${data.snapshot.weeklyStreakDays === 1 ? "" : "s"} this week.`
              : "Finish a task this week to light up your tracker."}
          </Text>
          <View style={styles.weekRow}>
            {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
              <View
                key={`${label}-${index}`}
                style={[styles.dayDot, data.snapshot.weeklyCompletedDayIndexes.includes(index) && styles.dayDotActive]}
              >
                <Text style={[styles.dayLabel, data.snapshot.weeklyCompletedDayIndexes.includes(index) && styles.dayLabelActive]}>{label}</Text>
              </View>
            ))}
          </View>
        </SurfaceCard>

        <SurfaceCard tone="blue">
          <Text style={styles.nextRewardEyebrow}>Next Big Reward</Text>
          <Text style={styles.nextRewardTitle}>{featuredReward ? featuredReward.title.toUpperCase() : "NO REWARD YET"}</Text>
          <Text style={styles.nextRewardBody}>
            {featuredReward ? `${featuredReward.cost} stars to unlock` : "Ask a parent to add rewards."}
          </Text>
        </SurfaceCard>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  goalProgress: {
    gap: 10
  },
  goalTrack: {
    height: 18,
    borderRadius: tokens.radius.pill,
    backgroundColor: "#d5eefa",
    overflow: "hidden"
  },
  goalFill: {
    width: "60%",
    height: "100%",
    backgroundColor: tokens.color.tertiary
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  goalMeta: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.color.textMuted
  },
  emptyTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: tokens.color.text
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 21,
    color: tokens.color.textMuted
  },
  taskGrid: {
    gap: tokens.spacing.md
  },
  taskGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  taskMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  taskCopy: {
    flex: 1
  },
  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.secondaryContainer
  },
  taskIconDone: {
    backgroundColor: "#c6efc6"
  },
  taskIconClaimed: {
    backgroundColor: "#d9eefc"
  },
  taskTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    color: tokens.color.text
  },
  taskPoints: {
    marginTop: 4,
    fontSize: 14,
    color: tokens.color.textMuted
  },
  streakTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: tokens.color.text
  },
  streakBody: {
    fontSize: 15,
    lineHeight: 21,
    color: tokens.color.textMuted
  },
  weekRow: {
    flexDirection: "row",
    gap: 8
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8e7ef"
  },
  dayDotActive: {
    backgroundColor: tokens.color.tertiary
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.color.textMuted
  },
  dayLabelActive: {
    color: tokens.color.white
  },
  nextRewardEyebrow: {
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "700",
    color: tokens.color.secondary
  },
  nextRewardTitle: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    color: tokens.color.text
  },
  nextRewardBody: {
    fontSize: 16,
    color: tokens.color.textMuted
  }
});

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
