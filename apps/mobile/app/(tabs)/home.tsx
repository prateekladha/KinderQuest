import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { GradientHero, Pill, SurfaceCard } from "../../components/cards";
import { useAuth } from "../../components/auth-provider";
import { LoadingState } from "../../components/loading-state";
import { ScreenShell, SectionHeading } from "../../components/screen-shell";
import { useAppData } from "../../lib/app-data";
import { registerDebugTap } from "../../lib/debug-unlock";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { data, isLoading, summary, refresh } = useAppData();
  const { client } = useAuth();

  if (isLoading || !data || !summary) {
    return <LoadingState />;
  }

  if (data.currentUserRole === "parent") {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  const nextRewardLabel = data.rewards.find((reward) => reward.cost > data.snapshot.childBalance)?.title ?? "Choose any reward";
  const encouragingSubtitle = data.snapshot.childBalance > 0
    ? `You're doing amazing today, ${data.snapshot.childName}.`
    : `Start with one small task today, ${data.snapshot.childName}.`;

  return (
    <ScreenShell
      subtitle="Points & Rewards"
      headerRight={<Pill label={`${data.snapshot.childBalance} Stars`} />}
      onRefresh={refresh}
      refreshing={isLoading}
      title={
        <Pressable onPress={registerDebugTap}>
          <Text style={styles.screenTitle}>{`${data.snapshot.childName}'s Home`}</Text>
        </Pressable>
      }
    >
      <GradientHero
        eyebrow="Your current balance"
        subtitle={encouragingSubtitle}
        title={`${data.snapshot.childBalance}`}
      >
        <View style={styles.heroBadge}>
          <Ionicons color={tokens.color.primary} name="star" size={22} />
        </View>
      </GradientHero>

      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        <SurfaceCard>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.levelTitle}>{data.snapshot.levelLabel}</Text>
              <Text style={styles.levelSubtext}>Next reward: {nextRewardLabel}</Text>
            </View>
            <Text style={styles.levelScore}>
              {data.snapshot.levelProgressCurrent} / {data.snapshot.levelProgressTarget}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${summary.levelPercent}%` }]} />
          </View>
          <Text style={styles.progressCaption}>
            {data.snapshot.levelProgressTarget - data.snapshot.levelProgressCurrent} more stars to level up
          </Text>
        </SurfaceCard>

        <View style={styles.stack}>
          <Pressable onPress={() => router.push("/(tabs)/tasks")}>
            <SurfaceCard tone="white">
            <View style={styles.featureIconYellow}>
              <Ionicons color={tokens.color.primary} name="checkmark-circle" size={26} />
            </View>
            <Text style={styles.featureTitle}>Claim Points</Text>
            <Text style={styles.featureBody}>Check off your finished tasks and collect your shiny stars.</Text>
            <Text style={styles.featureLink}>Let&apos;s go</Text>
            </SurfaceCard>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/store")}>
            <SurfaceCard tone="white">
            <View style={styles.featureIconBlue}>
              <Ionicons color={tokens.color.secondary} name="briefcase" size={24} />
            </View>
            <Text style={styles.featureTitle}>Star Store</Text>
            <Text style={styles.featureBody}>Trade your stars for toys, games, and awesome adventures.</Text>
            <Text style={styles.featureLink}>Browse items</Text>
            </SurfaceCard>
          </Pressable>
        </View>
      </View>

      <SectionHeading rightLabel={`${data.recentWins.length} Recent`} title="Recent Wins" />
      <View style={styles.stack}>
        {data.recentWins.length === 0 ? (
          <SurfaceCard tone="white">
            <Text style={styles.accountTitle}>No wins yet</Text>
            <Text style={styles.accountBody}>Approved tasks will show up here after a parent confirms them.</Text>
          </SurfaceCard>
        ) : data.recentWins.map((win) => (
          <SurfaceCard key={win.id} tone="green">
            <View style={styles.rowBetween}>
              <View style={styles.winMeta}>
                <View style={styles.winIcon}>
                  <Ionicons color={tokens.color.success} name="happy" size={18} />
                </View>
                <View style={styles.winCopy}>
                  <Text style={styles.winTitle}>{win.title}</Text>
                  <Text style={styles.winWhen}>{win.completedAtLabel}</Text>
                </View>
              </View>
              <Text style={styles.winPoints}>{`+${win.pointsEarned}`}</Text>
            </View>
          </SurfaceCard>
        ))}
      </View>

      <SurfaceCard tone="white">
        <Text style={styles.accountTitle}>Account</Text>
        <Text style={styles.accountBody}>Signed in as {data.snapshot.childName}. Use this if you want to switch family members.</Text>
        <View style={styles.accountActionRow}>
          <Text onPress={() => void client?.auth.signOut()} style={styles.signOutLink}>
            Sign Out
          </Text>
        </View>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: tokens.spacing.lg
  },
  gridTablet: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  stack: {
    flex: 1,
    gap: tokens.spacing.md
  },
  heroBadge: {
    position: "absolute",
    right: 26,
    top: 46,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8d7"
  },
  screenTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: tokens.color.text
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  levelTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: tokens.color.text
  },
  levelSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: tokens.color.textMuted
  },
  levelScore: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.text
  },
  progressTrack: {
    height: 18,
    borderRadius: tokens.radius.pill,
    backgroundColor: "#bfe3f8",
    overflow: "hidden"
  },
  progressFill: {
    width: "62%",
    height: "100%",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.tertiary
  },
  progressCaption: {
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "800",
    color: tokens.color.textSoft
  },
  featureIconYellow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1a6"
  },
  featureIconBlue: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.secondaryContainer
  },
  featureTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: tokens.color.text
  },
  featureBody: {
    fontSize: 16,
    lineHeight: 22,
    color: tokens.color.textMuted
  },
  featureLink: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.secondary
  },
  winMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  winCopy: {
    flex: 1,
    minWidth: 0
  },
  winIcon: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bff1bb"
  },
  winTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.color.text,
    flexShrink: 1
  },
  winWhen: {
    marginTop: 2,
    fontSize: 13,
    color: tokens.color.textMuted
  },
  winPoints: {
    flexShrink: 0,
    marginLeft: 12,
    fontSize: 22,
    fontWeight: "900",
    color: tokens.color.success
  },
  accountTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.color.text
  },
  accountBody: {
    fontSize: 15,
    lineHeight: 21,
    color: tokens.color.textMuted
  },
  accountActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  signOutLink: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.color.secondary
  }
});
