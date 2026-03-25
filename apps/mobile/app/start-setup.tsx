import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@kinderquest/ui";
import { useAuth } from "../components/auth-provider";
import { ActionButton, SurfaceCard } from "../components/cards";
import { LoadingState } from "../components/loading-state";
import { ScreenShell } from "../components/screen-shell";
import { useMembershipState } from "../lib/membership";

export default function StartSetupScreen() {
  const { client, session, isLoading: authLoading } = useAuth();
  const { isLoading, hasMember, invite } = useMembershipState(Boolean(session));

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  if (hasMember) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (invite) {
    return <Redirect href="/accept-invite" />;
  }

  return (
    <ScreenShell subtitle="Family setup" title="Choose Setup">
      <SurfaceCard tone="white">
        <Text style={styles.title}>How should this account join?</Text>
        <Text style={styles.body}>
          If this is the first parent account, create a family. If this is a child account or another parent joining an existing family, ask the family owner to create an invite for this exact email address first.
        </Text>
        <ActionButton label="Create Family" onPress={() => router.push("/create-family")} />
        <ActionButton label="Check Invite Again" onPress={() => router.replace("/accept-invite")} quiet />
        <ActionButton
          label="Sign Out"
          onPress={() => {
            void client?.auth.signOut();
          }}
          quiet
        />
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: tokens.color.textMuted
  }
});
