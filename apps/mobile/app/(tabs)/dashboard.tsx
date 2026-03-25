import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Redirect } from "expo-router";
import { tokens } from "@kinderquest/ui";
import { Pill, SurfaceCard } from "../../components/cards";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useAppData } from "../../lib/app-data";
import { registerDebugTap } from "../../lib/debug-unlock";

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { data, isLoading, refresh } = useAppData();

  if (isLoading || !data) {
    return <LoadingState />;
  }

  if (data.currentUserRole !== "parent") {
    return <Redirect href="/(tabs)/home" />;
  }

  const totalStars = data.childMembers.reduce((sum, child) => sum + child.starsBalance, 0);
  const assignedTasks = data.childMembers.reduce((sum, child) => sum + child.assignedTasks, 0);
  const claimedTasks = data.childMembers.reduce((sum, child) => sum + child.claimedTasks, 0);
  const approvedRewards = data.childMembers.reduce((sum, child) => sum + child.approvedRewards, 0);
  const fulfilledRewards = data.childMembers.reduce((sum, child) => sum + child.fulfilledRewards, 0);
  const approvedTodayPoints = data.childMembers.reduce((sum, child) => sum + child.approvedTodayPoints, 0);
  const pendingRewardRequests = data.approvals.filter((item) => item.entityType === "reward_redemption").length;
  const activeRewards = data.rewards.length;

  return (
    <ScreenShell
      headerRight={<Pill label={`${totalStars} Stars`} />}
      onRefresh={refresh}
      refreshing={isLoading}
      subtitle="Parent Overview"
      title={
        <Pressable onPress={registerDebugTap}>
          <Text style={styles.screenTitle}>Family Dashboard</Text>
        </Pressable>
      }
    >
      <SurfaceCard tone="blue">
        <Text style={styles.heroTitle}>Family Snapshot</Text>
        <Text style={styles.heroBody}>
          See every child&apos;s progress at a glance. Claimed tasks waiting for same-day approval show up here and in the Approvals tab.
        </Text>
      </SurfaceCard>

      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Family Stars</Text>
            <Text style={styles.metricValue}>{totalStars}</Text>
            <Text style={styles.metricBody}>Combined balance across all children.</Text>
          </SurfaceCard>
        </View>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Waiting Approval</Text>
            <Text style={styles.metricValue}>{claimedTasks}</Text>
            <Text style={styles.metricBody}>Claimed tasks still pending parent review.</Text>
          </SurfaceCard>
        </View>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Assigned Today</Text>
            <Text style={styles.metricValue}>{assignedTasks}</Text>
            <Text style={styles.metricBody}>Fresh daily tasks ready to be claimed.</Text>
          </SurfaceCard>
        </View>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Active Rewards</Text>
            <Text style={styles.metricValue}>{activeRewards}</Text>
            <Text style={styles.metricBody}>Rewards currently available for children to request.</Text>
          </SurfaceCard>
        </View>
      </View>

      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Reward Requests</Text>
            <Text style={styles.metricValue}>{pendingRewardRequests}</Text>
            <Text style={styles.metricBody}>Pending reward redemptions waiting for parent approval.</Text>
          </SurfaceCard>
        </View>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Rewards Approved</Text>
            <Text style={styles.metricValue}>{approvedRewards}</Text>
            <Text style={styles.metricBody}>Rewards approved by parents and ready for children to receive.</Text>
          </SurfaceCard>
        </View>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Rewards Fulfilled</Text>
            <Text style={styles.metricValue}>{fulfilledRewards}</Text>
            <Text style={styles.metricBody}>Rewards marked fulfilled by children after delivery.</Text>
          </SurfaceCard>
        </View>
        <View style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
          <SurfaceCard tone="white">
            <Text style={styles.metricLabel}>Approved Today</Text>
            <Text style={styles.metricValue}>{approvedTodayPoints}</Text>
            <Text style={styles.metricBody}>Stars credited after completed task approvals.</Text>
          </SurfaceCard>
        </View>
      </View>

      <SectionHeading title="Children" rightLabel={`${data.childMembers.length} Profiles`} />
      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        {data.childMembers.map((child) => (
          <View key={child.id} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
            <SurfaceCard tone="white">
              <View style={styles.childHeader}>
                <Text style={styles.childName}>{child.displayName}</Text>
                <Pill label={`${child.starsBalance} Stars`} tone="blue" />
              </View>
              <View style={styles.childStats}>
                <Text style={styles.childStat}>Assigned: {child.assignedTasks}</Text>
                <Text style={styles.childStat}>Waiting: {child.claimedTasks}</Text>
                <Text style={styles.childStat}>Approved: {child.approvedTasks}</Text>
                <Text style={styles.childStat}>Rewards Approved: {child.approvedRewards}</Text>
                <Text style={styles.childStat}>Rewards Fulfilled: {child.fulfilledRewards}</Text>
              </View>
              <Pressable style={styles.childChip}>
                <Text style={styles.childChipLabel}>Managed from Approvals and Manage tabs</Text>
              </Pressable>
            </SurfaceCard>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    color: tokens.color.text
  },
  screenTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: tokens.color.text
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 22,
    color: tokens.color.textMuted
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
  metricLabel: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    color: tokens.color.textSoft
  },
  metricValue: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    color: tokens.color.text
  },
  metricBody: {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.color.textMuted
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  childName: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: tokens.color.text
  },
  childStats: {
    gap: 6
  },
  childStat: {
    fontSize: 14,
    color: tokens.color.textMuted
  },
  childChip: {
    alignSelf: "flex-start",
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.surfaceContainerLow
  },
  childChipLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.color.textSoft
  }
});
