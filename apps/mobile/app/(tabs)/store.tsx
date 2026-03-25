import { useEffect, useState } from "react";
import { Redirect, usePathname } from "expo-router";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { ActionButton, Pill, SurfaceCard } from "../../components/cards";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell } from "../../components/screen-shell";
import { useToast } from "../../components/toast-provider";
import { useAppData } from "../../lib/app-data";

export default function StoreScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const pathname = usePathname();
  const { data, isLoading, source, redeemReward, refresh } = useAppData();
  const { showToast } = useToast();
  const [pendingPurchaseRewardId, setPendingPurchaseRewardId] = useState<string | null>(null);
  const isParentView = data?.currentUserRole === "parent";

  useEffect(() => {
    if (pathname === "/store" && !isLoading) {
      void refresh();
    }
  }, [pathname]);

  if (isLoading || !data) {
    return <LoadingState />;
  }

  if (data.currentUserRole === "parent") {
    return <Redirect href="/(tabs)/parents" />;
  }

  async function handleRedeemReward(rewardId: string) {
    setPendingPurchaseRewardId(rewardId);

    if (source !== "supabase") {
      showToast("Reward actions are unavailable until live family data loads.", "error");
      setPendingPurchaseRewardId(null);
      return;
    }

    if (isParentView) {
      showToast("Switch to a child account to redeem rewards.", "error");
      setPendingPurchaseRewardId(null);
      return;
    }

    try {
      await redeemReward(rewardId);
      showToast("Reward request sent to your parent.");
    } catch (nextError) {
      showToast(getErrorMessage(nextError, "Could not redeem reward right now."), "error");
    } finally {
      setPendingPurchaseRewardId(null);
    }
  }

  return (
    <ScreenShell
      headerRight={<Pill label={`${data.snapshot.childBalance} Stars`} />}
      subtitle="Points & Rewards"
      title="The Magic Toy Box"
    >
      <View style={styles.hero}>
        <Pill label="Available Rewards" tone="green" />
        <Text style={styles.heroBody}>Spend your hard-earned stars on an amazing reward. What will you pick today?</Text>
      </View>
      {data.rewards.length === 0 ? (
        <SurfaceCard tone="white">
          <Text style={styles.emptyTitle}>No rewards available yet</Text>
          <Text style={styles.emptyBody}>
            Ask a parent to add rewards for this family before shopping here.
          </Text>
        </SurfaceCard>
      ) : (
        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          {data.rewards.map((reward) => {
            const isLiveReward = isUuid(reward.id);
            const isRequestedReward = reward.redemptionStatus === "requested";
            const isFulfilledReward = reward.redemptionStatus === "fulfilled";
            const isBuying = pendingPurchaseRewardId === reward.id;
            const onPress =
              isParentView || source !== "supabase" || !isLiveReward || isRequestedReward
                ? undefined
                : () => void handleRedeemReward(reward.id);

            return (
              <View key={reward.id} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
                <SurfaceCard tone="white">
                  <View style={[styles.imageShell, { backgroundColor: reward.accentColor }]}>
                    <Ionicons color={tokens.color.primary} name={reward.icon} size={40} />
                  </View>
                  <Text style={styles.cardTitle}>{reward.title}</Text>
                  <Text style={styles.cardSubtext}>
                    {isRequestedReward
                      ? "This reward is waiting for parent approval."
                      : isFulfilledReward
                        ? "This reward was fulfilled. You can request it again any time."
                        : "Exciting reward ready to unlock."}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardCost}>{reward.cost}</Text>
                    <ActionButton
                      icon={<Ionicons color={tokens.color.text} name="star" size={14} />}
                      label={
                        isParentView
                          ? "Child Only"
                          : source !== "supabase" || !isLiveReward
                            ? "Unavailable"
                          : isRequestedReward
                            ? "Requested"
                          : isFulfilledReward
                            ? isBuying
                              ? "Buying..."
                              : "Buy Again"
                          : isBuying
                            ? "Buying..."
                            : "Buy"
                      }
                      onPress={onPress}
                      quiet={isParentView || source !== "supabase" || !isLiveReward || isRequestedReward}
                    />
                  </View>
                </SurfaceCard>
              </View>
            );
          })}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: tokens.radius.large,
    padding: 20,
    gap: 12,
    backgroundColor: "#ebf8df"
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 22,
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
  imageShell: {
    height: 160,
    borderRadius: tokens.radius.medium,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: tokens.color.text
  },
  cardSubtext: {
    fontSize: 14,
    color: tokens.color.textMuted
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  cardCost: {
    fontSize: 24,
    fontWeight: "900",
    color: tokens.color.primary
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
