import { useState } from "react";
import { Redirect } from "expo-router";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { ActionButton, Pill, SurfaceCard } from "../../components/cards";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useToast } from "../../components/toast-provider";
import { useAppData } from "../../lib/app-data";

export default function ApprovalsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { data, isLoading, approveTaskApproval, rejectTaskApproval, approveRewardApproval, rejectRewardApproval, refresh } = useAppData();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<"task_assignment" | "reward_redemption">("task_assignment");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | null>(null);

  if (isLoading || !data) {
    return <LoadingState />;
  }

  if (data.currentUserRole !== "parent") {
    return <Redirect href="/(tabs)/home" />;
  }

  const sortedApprovals = [...data.approvals].sort(
    (left, right) => Date.parse(right.sortTimestamp) - Date.parse(left.sortTimestamp)
  );
  const filteredApprovals = sortedApprovals.filter((item) => item.entityType === selectedType);
  const taskApprovalCount = sortedApprovals.filter((item) => item.entityType === "task_assignment").length;
  const rewardApprovalCount = sortedApprovals.filter((item) => item.entityType === "reward_redemption").length;

  async function handleApprove(id: string) {
    if (!data) {
      return;
    }

    setBusyId(id);
    setBusyAction("approve");
    try {
      const item = data.approvals.find((approval) => approval.id === id);
      if (item?.entityType === "reward_redemption") {
        await approveRewardApproval(id);
      } else {
        await approveTaskApproval(id);
      }
    } catch (nextError) {
      showToast(nextError instanceof Error ? nextError.message : "Could not approve task right now.", "error");
      return;
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
    showToast("Approval completed.");
  }

  async function handleReject(id: string) {
    if (!data) {
      return;
    }

    setBusyId(id);
    setBusyAction("reject");
    try {
      const item = data.approvals.find((approval) => approval.id === id);
      if (item?.entityType === "reward_redemption") {
        await rejectRewardApproval(id);
      } else {
        await rejectTaskApproval(id);
      }
    } catch (nextError) {
      showToast(nextError instanceof Error ? nextError.message : "Could not reject task right now.", "error");
      return;
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
    showToast("Request rejected.");
  }

  return (
    <ScreenShell
      headerRight={<Pill label={`${sortedApprovals.length} Pending`} tone="orange" />}
      onRefresh={refresh}
      refreshing={isLoading}
      subtitle="Parent Review"
      title="Approvals"
    >
      <SectionHeading title="Pending Approvals" />
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setSelectedType("task_assignment")}
          style={[styles.filterChip, selectedType === "task_assignment" && styles.filterChipActive]}
        >
          <Text style={styles.filterChipLabel}>{`Tasks (${taskApprovalCount})`}</Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedType("reward_redemption")}
          style={[styles.filterChip, selectedType === "reward_redemption" && styles.filterChipActive]}
        >
          <Text style={styles.filterChipLabel}>{`Rewards (${rewardApprovalCount})`}</Text>
        </Pressable>
      </View>
      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        {filteredApprovals.length === 0 ? (
          <SurfaceCard tone="white">
            <Text style={styles.emptyTitle}>Nothing waiting right now</Text>
            <Text style={styles.emptyBody}>
              {selectedType === "task_assignment"
                ? "When a child claims a task, it will show up here for same-day approval."
                : "When a child requests a reward, it will show up here for parent approval."}
            </Text>
          </SurfaceCard>
        ) : filteredApprovals.map((item) => (
          <View key={item.id} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
            <SurfaceCard tone="white">
              <View style={styles.row}>
                <View style={styles.iconShell}>
                  <Ionicons
                    color={item.entityType === "reward_redemption" ? tokens.color.secondary : tokens.color.primary}
                    name={item.entityType === "reward_redemption" ? "gift" : "checkmark-circle"}
                    size={18}
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                  <Text style={styles.meta}>{item.meta}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <ActionButton
                  label={busyId === item.id && busyAction === "approve" ? "Approving..." : "Approve"}
                  onPress={() => void handleApprove(item.id)}
                />
                <ActionButton
                  label={busyId === item.id && busyAction === "reject" ? "Rejecting..." : "Reject"}
                  quiet
                  onPress={() => void handleReject(item.id)}
                />
              </View>
            </SurfaceCard>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  filterChip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.surfaceContainerLow
  },
  filterChipActive: {
    backgroundColor: tokens.color.secondaryContainer
  },
  filterChipLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.color.text
  },
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
  row: {
    flexDirection: "row",
    gap: 12
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1a6"
  },
  copy: {
    flex: 1
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    color: tokens.color.text
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: tokens.color.textMuted
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: tokens.color.textSoft
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  }
});
