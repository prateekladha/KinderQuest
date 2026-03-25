import { useState } from "react";
import { Redirect } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "@kinderquest/ui";
import { useAuth } from "../components/auth-provider";
import { LoadingState } from "../components/loading-state";
import { ScreenShell } from "../components/screen-shell";
import { useMembershipState } from "../lib/membership";

export default function CreateFamilyScreen() {
  const { session, isLoading: authLoading } = useAuth();
  const { isLoading, hasMember, invite, createFamily } = useMembershipState(Boolean(session));
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function submit() {
    setIsSubmitting(true);
    setError(null);

    try {
      await createFamily({
        familyName,
        displayName
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not create family.");
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenShell subtitle="First-time setup" title="Create Family">
      <View style={styles.card}>
        <Text style={styles.title}>Start your family space</Text>
        <Text style={styles.body}>
          Create the first family and attach this account as the parent owner.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Family Name</Text>
          <TextInput
            onChangeText={setFamilyName}
            placeholder="The Sharma Family"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={familyName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Your Display Name</Text>
          <TextInput
            onChangeText={setDisplayName}
            placeholder="Mom"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={displayName}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={() => void submit()} style={[styles.button, isSubmitting && styles.buttonDisabled]}>
          <Text style={styles.buttonLabel}>{isSubmitting ? "Creating..." : "Create Family"}</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: tokens.radius.large,
    backgroundColor: tokens.color.white,
    gap: 16
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: tokens.color.textMuted
  },
  field: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.text
  },
  input: {
    minHeight: 52,
    borderRadius: tokens.radius.medium,
    paddingHorizontal: 16,
    backgroundColor: tokens.color.surfaceContainerLow,
    color: tokens.color.text,
    fontSize: 16
  },
  error: {
    color: "#b42318",
    fontSize: 14
  },
  button: {
    minHeight: 52,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.primaryContainer
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.text
  }
});
