import { Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@kinderquest/ui";
import { GradientHero, SurfaceCard } from "../components/cards";
import { LoadingState } from "../components/loading-state";
import { ScreenShell, SectionHeading } from "../components/screen-shell";
import { useAuth } from "../components/auth-provider";
import { useMembershipState } from "../lib/membership";

export default function IndexPage() {
  const { isLoading, session } = useAuth();
  const membership = useMembershipState(session);

  if (isLoading || (session && membership.isLoading)) {
    return <LoadingState />;
  }

  if (!session) {
    return (
      <ScreenShell subtitle="Family tasks and rewards" title="KinderQuest">
        <GradientHero
          eyebrow="For parents and children"
          subtitle="Turn daily habits into a fun reward journey. Parents assign, approve, and celebrate progress. Children complete tasks and unlock rewards."
          title="Build healthy routines together"
        >
          <View style={styles.heroBadge}>
            <Ionicons color={tokens.color.primary} name="rocket" size={24} />
          </View>
        </GradientHero>

        <View style={styles.ctaRow}>
        <Pressable onPress={() => router.push("/sign-in")} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>Sign In</Text>
        </Pressable>
        <Pressable onPress={() => router.push({ pathname: "/sign-in", params: { mode: "sign-up" } })} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonLabel}>Create Account</Text>
        </Pressable>
        </View>

        <SectionHeading title="Why Families Use It" />
        <View style={styles.stack}>
          <SurfaceCard tone="white">
            <View style={styles.featureRow}>
              <View style={styles.featureIconYellow}>
                <Ionicons color={tokens.color.primary} name="checkbox" size={22} />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>Daily Tasks</Text>
                <Text style={styles.featureBody}>Parents create routines like brushing teeth, reading, and tidying up.</Text>
              </View>
            </View>
          </SurfaceCard>
          <SurfaceCard tone="white">
            <View style={styles.featureRow}>
              <View style={styles.featureIconBlue}>
                <Ionicons color={tokens.color.secondary} name="gift" size={22} />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>Meaningful Rewards</Text>
                <Text style={styles.featureBody}>Children earn stars, request rewards, and mark them fulfilled after receiving them.</Text>
              </View>
            </View>
          </SurfaceCard>
          <SurfaceCard tone="white">
            <View style={styles.featureRow}>
              <View style={styles.featureIconGreen}>
                <Ionicons color={tokens.color.success} name="notifications" size={22} />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>Fast Family Feedback</Text>
                <Text style={styles.featureBody}>Parents and children stay in sync through approvals, history, and notifications.</Text>
              </View>
            </View>
          </SurfaceCard>
        </View>

      </ScreenShell>
    );
  }

  if (membership.hasMember) {
    return <Redirect href={membership.role === "parent" ? "/dashboard" : "/home"} />;
  }

  return <Redirect href={membership.invite ? "/accept-invite" : "/start-setup"} />;
}

const styles = StyleSheet.create({
  heroBadge: {
    position: "absolute",
    right: 24,
    top: 38,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8d7"
  },
  ctaRow: {
    flexDirection: "row",
    gap: 12
  },
  primaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.primaryContainer
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.text
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.surfaceContainerLow
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.secondary
  },
  stack: {
    gap: tokens.spacing.md
  },
  featureRow: {
    flexDirection: "row",
    gap: 14
  },
  featureCopy: {
    flex: 1
  },
  featureTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: tokens.color.text
  },
  featureBody: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    color: tokens.color.textMuted
  },
  featureIconYellow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1a6"
  },
  featureIconBlue: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.secondaryContainer
  },
  featureIconGreen: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8f7d3"
  }
});
