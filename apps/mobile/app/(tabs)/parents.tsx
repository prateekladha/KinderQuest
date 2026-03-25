import { useEffect, useRef, useState } from "react";
import { Redirect, router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions, type LayoutChangeEvent, type ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { ActionButton, GradientHero, Pill, SurfaceCard } from "../../components/cards";
import { useAuth } from "../../components/auth-provider";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useToast } from "../../components/toast-provider";
import { useAppData } from "../../lib/app-data";

export default function ParentsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const pathname = usePathname();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<"task" | "reward", number>>({
    task: 0,
    reward: 0
  });
  const { client } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, summary, createFamilyMemberInvite, createTask, createReward, refresh } = useAppData();
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"parent" | "child">("child");
  const [inviteState, setInviteState] = useState<"idle" | "saving" | "done">("idle");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPoints, setTaskPoints] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [taskState, setTaskState] = useState<"idle" | "saving" | "done">("idle");
  const [selectedDashboardChildId, setSelectedDashboardChildId] = useState<string>("all");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardState, setRewardState] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    if (pathname === "/parents" && !isLoading) {
      void refresh();
    }
  }, [pathname]);

  if (isLoading || !data || !summary) {
    return <LoadingState />;
  }

  const availableChildren = data.childMembers;
  const selectedChildren = selectedDashboardChildId === "all"
    ? availableChildren
    : availableChildren.filter((child) => child.id === selectedDashboardChildId);
  const selectedLabel = selectedDashboardChildId === "all"
    ? "All Children"
    : availableChildren.find((child) => child.id === selectedDashboardChildId)?.displayName ?? "Child";
  const totalStars = selectedChildren.reduce((sum, child) => sum + child.starsBalance, 0);
  const assignedTasks = selectedChildren.reduce((sum, child) => sum + child.assignedTasks, 0);
  const claimedTasks = selectedChildren.reduce((sum, child) => sum + child.claimedTasks, 0);
  const approvedRewards = selectedChildren.reduce((sum, child) => sum + child.approvedRewards, 0);
  const approvedTodayPoints = selectedChildren.reduce((sum, child) => sum + child.approvedTodayPoints, 0);
  const monthlyDistributed = totalStars;
  const monthlyTarget = Math.max(200, selectedChildren.length * 200);
  const monthlyPercent = Math.min(100, Math.round((monthlyDistributed / monthlyTarget) * 100));
  const monthlyRewardLabel = data.rewards.find((reward) => reward.cost > totalStars)?.title ?? "next family reward";

  if (data.currentUserRole !== "parent") {
    return <Redirect href="/(tabs)/home" />;
  }

  async function handleInviteSubmit() {
    setInviteState("saving");

    try {
      await createFamilyMemberInvite({
        email: inviteEmail,
        displayName: inviteName,
        role: inviteRole
      });
      setInviteName("");
      setInviteEmail("");
      setInviteRole("child");
      setInviteState("done");
      showToast("Invite created successfully.");
    } catch (error) {
      setInviteState("idle");
      showToast(error instanceof Error ? error.message : "Could not create family invite.", "error");
    }
  }

  async function handleTaskSubmit() {
    setTaskState("saving");

    try {
      await createTask({
        title: taskTitle,
        points: Number(taskPoints),
        childMemberId: selectedChildId ?? undefined
      });
      setTaskTitle("");
      setTaskPoints("");
      setSelectedChildId(null);
      setTaskState("done");
      showToast("Task created successfully.");
    } catch (error) {
      setTaskState("idle");
      showToast(error instanceof Error ? error.message : "Could not create task.", "error");
    }
  }

  async function handleRewardSubmit() {
    setRewardState("saving");

    try {
      await createReward({
        title: rewardTitle,
        cost: Number(rewardCost)
      });
      setRewardTitle("");
      setRewardCost("");
      setRewardState("done");
      showToast("Reward created successfully.");
    } catch (error) {
      setRewardState("idle");
      showToast(error instanceof Error ? error.message : "Could not create reward.", "error");
    }
  }

  function registerSection(key: "task" | "reward") {
    return (event: LayoutChangeEvent) => {
      sectionOffsets.current[key] = event.nativeEvent.layout.y;
    };
  }

  function scrollToSection(key: "task" | "reward") {
    scrollRef.current?.scrollTo({
      y: Math.max(0, sectionOffsets.current[key] - 24),
      animated: true
    });
  }

  return (
    <ScreenShell
      scrollRef={scrollRef}
      headerRight={<Pill label={`${totalStars} Stars`} />}
      subtitle="Points & Rewards"
      title="Parent Control Panel"
    >
      <GradientHero
        subtitle={`Viewing ${selectedLabel}. Approve claimed tasks today so tomorrow's daily copy stays clean and ready to claim again.`}
        title="Parent Control Panel"
      />

      <SectionHeading title="Child View" />
      <SurfaceCard tone="white">
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setSelectedDashboardChildId("all")}
            style={[styles.roleChip, selectedDashboardChildId === "all" && styles.roleChipActive]}
          >
            <Text style={styles.roleChipLabel}>All Children</Text>
          </Pressable>
          {availableChildren.map((child) => (
            <Pressable
              key={child.id}
              onPress={() => setSelectedDashboardChildId(child.id)}
              style={[styles.roleChip, selectedDashboardChildId === child.id && styles.roleChipActive]}
            >
              <Text style={styles.roleChipLabel}>{child.displayName}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="blue">
            <Text style={styles.goalTitle}>{selectedLabel}</Text>
            <Text style={styles.goalValue}>{totalStars}</Text>
            <Text style={styles.goalCaption}>Current stars balance</Text>
            <View style={styles.summaryStats}>
              <Text style={styles.summaryStat}>Assigned: {assignedTasks}</Text>
              <Text style={styles.summaryStat}>Waiting: {claimedTasks}</Text>
              <Text style={styles.summaryStat}>Rewards Bought: {approvedRewards}</Text>
            </View>
          </SurfaceCard>
        </View>

        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.goalTitle}>Approved Today</Text>
            <Text style={styles.goalValue}>{approvedTodayPoints}</Text>
            <Text style={styles.goalCaption}>Stars credited after approval</Text>
            <Text style={styles.goalFootnote}>
              Approving a claimed task refreshes the child totals immediately and tomorrow's daily assignment is generated from the reusable task definition.
            </Text>
          </SurfaceCard>
        </View>
      </View>

      <SectionHeading title="Quick Actions" />
      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        {data.parentActions.map((action) => (
          <View key={action.id} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
            <Pressable
              onPress={() => {
                if (action.id === "action-behavior") {
                  scrollToSection("task");
                  return;
                }

                if (action.id === "action-rewards") {
                  scrollToSection("reward");
                  return;
                }

                void router.push("/(tabs)/history");
              }}
            >
              <SurfaceCard tone="white">
                <View style={styles.actionRow}>
                  <View style={styles.actionIcon}>
                    <Ionicons color={tokens.color.secondary} name={action.icon} size={20} />
                  </View>
                  <Text style={styles.actionText}>{action.title}</Text>
                  <Ionicons color={tokens.color.textSoft} name="chevron-forward" size={18} />
                </View>
              </SurfaceCard>
            </Pressable>
          </View>
        ))}
      </View>

      <SectionHeading title="Add Family Member" />
      <SurfaceCard tone="white">
        <Text style={styles.inviteTitle}>Invite a parent or child</Text>
        <Text style={styles.inviteBody}>
          This creates an invite record for a real account to join the family. Direct account creation is not done from the client app.
        </Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Display Name</Text>
          <TextInput
            onChangeText={setInviteName}
            placeholder="Leo"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={inviteName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setInviteEmail}
            placeholder="leo@example.com"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={inviteEmail}
          />
        </View>

        <View style={styles.roleRow}>
          <Pressable
            onPress={() => setInviteRole("child")}
            style={[styles.roleChip, inviteRole === "child" && styles.roleChipActive]}
          >
            <Text style={styles.roleChipLabel}>Child</Text>
          </Pressable>
          <Pressable
            onPress={() => setInviteRole("parent")}
            style={[styles.roleChip, inviteRole === "parent" && styles.roleChipActive]}
          >
            <Text style={styles.roleChipLabel}>Parent</Text>
          </Pressable>
        </View>

        <ActionButton
          label={inviteState === "saving" ? "Creating..." : "Create Invite"}
          onPress={() => void handleInviteSubmit()}
        />
      </SurfaceCard>

      <View onLayout={registerSection("task")}>
      <SectionHeading title="Create Task" />
      <SurfaceCard tone="white">
        <Text style={styles.inviteTitle}>Add a new task</Text>
        <Text style={styles.inviteBody}>Create a task and assign it to a child for today.</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Task Title</Text>
          <TextInput
            onChangeText={setTaskTitle}
            placeholder="Brush teeth"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={taskTitle}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Points</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setTaskPoints}
            placeholder="10"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={taskPoints}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Assign To</Text>
          {availableChildren.length === 0 ? (
            <Text style={styles.formHint}>Add a child family member first before creating tasks.</Text>
          ) : (
            <View style={styles.roleRow}>
              {availableChildren.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => setSelectedChildId(child.id)}
                  style={[styles.roleChip, selectedChildId === child.id && styles.roleChipActive]}
                >
                  <Text style={styles.roleChipLabel}>{child.displayName}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <ActionButton
          label={taskState === "saving" ? "Creating..." : "Create Task"}
          onPress={availableChildren.length === 0 || !selectedChildId ? undefined : () => void handleTaskSubmit()}
          quiet={availableChildren.length === 0 || !selectedChildId}
        />
      </SurfaceCard>
      </View>

      <View onLayout={registerSection("reward")}>
      <SectionHeading title="Create Reward" />
      <SurfaceCard tone="white">
        <Text style={styles.inviteTitle}>Add a new reward</Text>
        <Text style={styles.inviteBody}>Create a reward children can unlock with their stars.</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Reward Title</Text>
          <TextInput
            onChangeText={setRewardTitle}
            placeholder="30 mins Screen Time"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={rewardTitle}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Cost</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setRewardCost}
            placeholder="50"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={rewardCost}
          />
        </View>

        <ActionButton
          label={rewardState === "saving" ? "Creating..." : "Create Reward"}
          onPress={() => void handleRewardSubmit()}
        />
      </SurfaceCard>
      </View>

      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="blue">
            <Text style={styles.goalTitle}>Monthly Goal</Text>
            <Text style={styles.goalValue}>
              {monthlyDistributed} / {monthlyTarget}
            </Text>
            <Text style={styles.goalCaption}>Stars distributed</Text>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${monthlyPercent}%` }]} />
            </View>
            <Text style={styles.goalFootnote}>
              {selectedLabel} is {Math.max(0, monthlyTarget - monthlyDistributed)} stars away from the {monthlyRewardLabel} reward.
            </Text>
          </SurfaceCard>
        </View>

        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <View style={styles.securityRow}>
              <View style={styles.securityIcon}>
                <Ionicons color={tokens.color.textSoft} name="shield-checkmark" size={18} />
              </View>
              <View style={styles.securityCopy}>
                <Text style={styles.securityTitle}>Secure Mode Active</Text>
                <Text style={styles.securityBody}>End-to-end behavior tracking encryption enabled.</Text>
              </View>
            </View>
          </SurfaceCard>
        </View>

        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.securityTitle}>Session</Text>
            <Text style={styles.securityBody}>Signed in to live family data.</Text>
            <ActionButton
              label="Sign Out"
              quiet
              onPress={async () => {
                await client?.auth.signOut();
              }}
            />
          </SurfaceCard>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: tokens.spacing.md
  },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  gridItem: {
    width: "100%"
  },
  gridItemTablet: {
    width: "48%"
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.surfaceContainerLow
  },
  actionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: tokens.color.text
  },
  inviteTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: tokens.color.text
  },
  inviteBody: {
    fontSize: 15,
    lineHeight: 21,
    color: tokens.color.textMuted
  },
  field: {
    gap: 8
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.text
  },
  input: {
    minHeight: 48,
    borderRadius: tokens.radius.medium,
    paddingHorizontal: 16,
    backgroundColor: tokens.color.surfaceContainerLow,
    color: tokens.color.text,
    fontSize: 16
  },
  roleRow: {
    flexDirection: "row",
    gap: 10
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  roleChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.surfaceContainerLow
  },
  roleChipActive: {
    backgroundColor: tokens.color.primaryContainer
  },
  roleChipLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.color.text
  },
  formHint: {
    fontSize: 14,
    color: "#b42318"
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: tokens.color.text
  },
  goalValue: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: tokens.color.text
  },
  goalCaption: {
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "800",
    color: tokens.color.textSoft
  },
  summaryStats: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap"
  },
  summaryStat: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.textMuted
  },
  goalTrack: {
    height: 16,
    borderRadius: tokens.radius.pill,
    backgroundColor: "#a9d5ea",
    overflow: "hidden"
  },
  goalFill: {
    width: "84%",
    height: "100%",
    backgroundColor: tokens.color.tertiary
  },
  goalFootnote: {
    fontSize: 13,
    lineHeight: 18,
    color: tokens.color.textMuted
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef4f7"
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.color.text,
    flexShrink: 1
  },
  securityBody: {
    marginTop: 4,
    fontSize: 14,
    color: tokens.color.textMuted,
    flexShrink: 1
  },
  securityCopy: {
    flex: 1,
    minWidth: 0
  }
});
