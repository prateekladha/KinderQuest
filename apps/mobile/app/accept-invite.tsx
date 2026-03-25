import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@kinderquest/ui";
import { useAuth } from "../components/auth-provider";
import { ActionButton, Pill, SurfaceCard } from "../components/cards";
import { LoadingState } from "../components/loading-state";
import { ScreenShell } from "../components/screen-shell";
import { useMembershipState } from "../lib/membership";

export default function AcceptInviteScreen() {
  const { session, isLoading: authLoading } = useAuth();
  const { isLoading, hasMember, invite, acceptInvite } = useMembershipState(Boolean(session));

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  if (hasMember) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (!invite) {
    return (
      <ScreenShell subtitle="Family setup" title="No Invitation Found">
        <SurfaceCard tone="white">
          <Text style={styles.title}>No pending family invite</Text>
          <Text style={styles.body}>
            This account is signed in, but there is no matching pending invite for its email address yet. If this is a child account, ask a parent to create an invite first.
          </Text>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell subtitle="Family setup" title="Join Family">
      <SurfaceCard tone="white">
        <Pill label={invite.role === "child" ? "Child Invite" : "Parent Invite"} tone="green" />
        <Text style={styles.title}>Accept your invite</Text>
        <Text style={styles.body}>
          Join the family as <Text style={styles.strong}>{invite.displayName}</Text>. Once accepted, this account will be linked to the family and can use live app features.
        </Text>
        <ActionButton label="Accept Invite" onPress={() => void acceptInvite()} />
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
  },
  strong: {
    fontWeight: "800",
    color: tokens.color.text
  }
});
