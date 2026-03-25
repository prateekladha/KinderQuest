import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { ActionButton, Pill, SurfaceCard } from "../../components/cards";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useToast } from "../../components/toast-provider";
import { useAppData } from "../../lib/app-data";

export default function RewardsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { data, isLoading, fulfillRewardRedemption, refresh } = useAppData();
  const { showToast } = useToast();
  const [pendingFulfillmentRedemptionId, setPendingFulfillmentRedemptionId] = useState<string | null>(null);

  if (isLoading || !data) {
    return <LoadingState />;
  }

  if (data.currentUserRole === "parent") {
    return <Redirect href="/(tabs)/parents" />;
  }

  const myRewards = data.rewards.filter((reward) =>
    reward.redemptionStatus === "requested" || reward.redemptionStatus === "approved" || reward.redemptionStatus === "fulfilled"
  );

  async function handleFulfillReward(redemptionId: string) {
    setPendingFulfillmentRedemptionId(redemptionId);

    try {
      await fulfillRewardRedemption(redemptionId);
      showToast("Reward marked fulfilled.");
    } catch (nextError) {
      showToast(getErrorMessage(nextError, "Could not mark reward fulfilled right now."), "error");
    } finally {
      setPendingFulfillmentRedemptionId(null);
    }
  }

  return (
    <ScreenShell
      headerRight={<Pill label={`${myRewards.length} Active`} tone="blue" />}
      onRefresh={refresh}
      refreshing={isLoading}
      subtitle="Points & Rewards"
      title="My Rewards"
    >
      <SectionHeading title="Reward Journey" />
      {myRewards.length === 0 ? (
        <SurfaceCard tone="white">
          <Text style={styles.emptyTitle}>No reward journey yet</Text>
          <Text style={styles.emptyBody}>
            Requested, approved, and fulfilled rewards will show up here so you can track what is happening.
          </Text>
        </SurfaceCard>
      ) : (
        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          {myRewards.map((reward) => {
            const redemptionId = reward.redemptionId ?? null;
            const isApprovedReward = reward.redemptionStatus === "approved" && redemptionId !== null;
            const isFulfilling = redemptionId !== null && pendingFulfillmentRedemptionId === redemptionId;

            return (
              <View key={`${reward.id}-journey`} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
                <SurfaceCard tone="white">
                  <View style={styles.row}>
                    <View style={styles.iconShell}>
                      <Ionicons color={tokens.color.secondary} name="gift" size={18} />
                    </View>
                    <View style={styles.copy}>
                      <Text style={styles.title}>{reward.title}</Text>
                      <Text style={styles.subtitle}>
                        {reward.redemptionStatus === "requested"
                          ? "Waiting for parent approval"
                          : reward.redemptionStatus === "approved"
                            ? "Approved and ready to be fulfilled"
                            : "Fulfilled successfully"}
                      </Text>
                      <Text style={styles.meta}>{`${reward.cost} stars`}</Text>
                    </View>
                    <Pill
                      label={
                        reward.redemptionStatus === "requested"
                          ? "Requested"
                          : reward.redemptionStatus === "approved"
                            ? "Approved"
                            : "Fulfilled"
                      }
                      tone={reward.redemptionStatus === "approved" ? "green" : reward.redemptionStatus === "fulfilled" ? "blue" : "orange"}
                    />
                  </View>
                  {isApprovedReward ? (
                    <View style={styles.actionRow}>
                      <ActionButton
                        label={isFulfilling ? "Fulfilling..." : "Mark Fulfilled"}
                        onPress={() => void handleFulfillReward(redemptionId)}
                      />
                    </View>
                  ) : null}
                </SurfaceCard>
              </View>
            );
          })}
        </View>
      )}
    </ScreenShell>
  );
}

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
    gap: 12,
    alignItems: "flex-start"
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.secondaryContainer
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
    marginTop: 8
  }
});
