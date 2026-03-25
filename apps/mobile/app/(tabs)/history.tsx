import { useEffect, useState } from "react";
import { Redirect, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { tokens } from "@kinderquest/ui";
import { ActionButton, Pill, SurfaceCard } from "../../components/cards";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useToast } from "../../components/toast-provider";
import { useAppData } from "../../lib/app-data";

export default function HistoryScreen() {
  const PAGE_SIZE = 12;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const pathname = usePathname();
  const { data, isLoading, historyPages, loadHistoryPage, refresh } = useAppData();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<"task_assignment" | "reward_redemption">("task_assignment");

  useEffect(() => {
    if (pathname !== "/history" || isLoading || data?.currentUserRole !== "parent") {
      return;
    }

    void loadHistoryPage(selectedType, { reset: true, limit: PAGE_SIZE }).catch((error) => {
      showToast(error instanceof Error ? error.message : "Could not load history right now.", "error");
    });
  }, [pathname, isLoading, data?.currentUserRole, selectedType]);

  useEffect(() => {
    if (pathname !== "/history" || isLoading || data?.currentUserRole !== "parent") {
      return;
    }

    const secondaryType = selectedType === "task_assignment" ? "reward_redemption" : "task_assignment";

    if (!historyPages[secondaryType].isInitialized) {
      void loadHistoryPage(secondaryType, { reset: true, limit: 1 }).catch(() => {
        // Keep the primary history load usable even if the secondary chip count fails.
      });
    }
  }, [pathname, isLoading, data?.currentUserRole, selectedType, historyPages.reward_redemption.isInitialized, historyPages.task_assignment.isInitialized]);

  if (isLoading || !data) {
    return <LoadingState />;
  }

  if (data.currentUserRole !== "parent") {
    return <Redirect href="/(tabs)/home" />;
  }

  const taskHistoryCount = historyPages.task_assignment.total;
  const rewardHistoryCount = historyPages.reward_redemption.total;
  const selectedHistoryPage = historyPages[selectedType];
  const visibleHistory = selectedHistoryPage.items;
  const hasMoreHistory = selectedHistoryPage.items.length < selectedHistoryPage.total;

  return (
    <ScreenShell
      headerRight={<Pill label={`${selectedHistoryPage.total} Items`} tone="blue" />}
      onRefresh={refresh}
      refreshing={isLoading}
      subtitle="Parent Review"
      title="History"
    >
      <SectionHeading title="Family History" />
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setSelectedType("task_assignment")}
          style={[styles.filterChip, selectedType === "task_assignment" && styles.filterChipActive]}
        >
          <Text style={styles.filterChipLabel}>{`Tasks (${taskHistoryCount})`}</Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedType("reward_redemption")}
          style={[styles.filterChip, selectedType === "reward_redemption" && styles.filterChipActive]}
        >
          <Text style={styles.filterChipLabel}>{`Rewards (${rewardHistoryCount})`}</Text>
        </Pressable>
      </View>
      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        {selectedHistoryPage.isLoading && visibleHistory.length === 0 ? (
          <SurfaceCard tone="white">
            <Text style={styles.emptyTitle}>Loading history...</Text>
            <Text style={styles.emptyBody}>Pulling the latest family activity from Supabase.</Text>
          </SurfaceCard>
        ) : visibleHistory.length === 0 ? (
          <SurfaceCard tone="white">
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyBody}>
              {selectedType === "task_assignment"
                ? "Approved, rejected, and missed task activity will appear here."
                : "Requested, approved, rejected, and fulfilled reward activity will appear here."}
            </Text>
          </SurfaceCard>
        ) : visibleHistory.map((item) => (
          <View key={item.id} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
            <SurfaceCard tone={item.tone === "green" ? "green" : item.tone === "blue" ? "blue" : "white"}>
              <View style={styles.row}>
                <View style={styles.copy}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.childDisplayName}</Text>
                  <Text style={styles.meta}>{item.meta}</Text>
                </View>
                <Pill label={item.statusLabel} tone={item.tone === "green" ? "green" : item.tone === "blue" ? "blue" : "orange"} />
              </View>
            </SurfaceCard>
          </View>
        ))}
        {hasMoreHistory ? (
          <SurfaceCard tone="white">
            <View style={styles.loadMoreWrap}>
              <Text style={styles.loadMoreText}>
                {`${selectedHistoryPage.total - selectedHistoryPage.items.length} more ${selectedType === "task_assignment" ? "task" : "reward"} items`}
              </Text>
              <ActionButton
                label={selectedHistoryPage.isLoading ? "Loading..." : "Load More"}
                onPress={() =>
                  void loadHistoryPage(selectedType, { limit: PAGE_SIZE }).catch((error) => {
                    showToast(error instanceof Error ? error.message : "Could not load more history.", "error");
                  })
                }
              />
            </View>
          </SurfaceCard>
        ) : null}
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
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
  loadMoreWrap: {
    gap: 12
  },
  loadMoreText: {
    fontSize: 14,
    color: tokens.color.textMuted
  }
});
