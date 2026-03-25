import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "@kinderquest/ui";
import { LoadingState } from "../components/loading-state";
import { ScreenShell } from "../components/screen-shell";
import { useAuth } from "../components/auth-provider";
import { registerDebugTap } from "../lib/debug-unlock";

export default function SignInScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const { client, session, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.mode === "sign-up") {
      setMode("sign-up");
    }

    if (params.mode === "sign-in") {
      setMode("sign-in");
    }
  }, [params.mode]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  async function submit() {
    if (!client) {
      setError("Supabase environment is not configured in apps/mobile/.env.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response =
      mode === "sign-in"
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({ email, password });

    if (response.error) {
      setError(response.error.message);
    }

    setIsSubmitting(false);
  }

  return (
    <ScreenShell subtitle="Family tasks and rewards" title="Sign In">
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.body}>Use your parent or child account to enter KinderQuest.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={tokens.color.textSoft}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={tokens.color.textSoft}
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
              value={password}
            />
            <Pressable
              accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setIsPasswordVisible((current) => !current)}
              style={styles.passwordToggle}
            >
              <Ionicons
                color={tokens.color.textSoft}
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={20}
              />
            </Pressable>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={() => {
            registerDebugTap();
            void submit();
          }}
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        >
          <Text style={styles.primaryButtonLabel}>
            {isSubmitting ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            registerDebugTap();
            setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>
            {mode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/")} style={styles.tertiaryButton}>
          <Text style={styles.tertiaryButtonLabel}>Back to Home</Text>
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
  passwordRow: {
    minHeight: 52,
    borderRadius: tokens.radius.medium,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: tokens.color.surfaceContainerLow,
    flexDirection: "row",
    alignItems: "center"
  },
  passwordInput: {
    flex: 1,
    minHeight: 52,
    color: tokens.color.text,
    fontSize: 16
  },
  passwordToggle: {
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  error: {
    color: "#b42318",
    fontSize: 14
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.primaryContainer
  },
  buttonDisabled: {
    opacity: 0.7
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.text
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.secondary
  },
  tertiaryButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  tertiaryButtonLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.color.textSoft
  }
});
