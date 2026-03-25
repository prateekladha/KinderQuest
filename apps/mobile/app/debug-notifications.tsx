import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { tokens } from "@kinderquest/ui";
import { SurfaceCard } from "../components/cards";
import { ScreenShell } from "../components/screen-shell";
import { useAuth } from "../components/auth-provider";
import { useNotificationDebug } from "../components/notification-provider";

export default function DebugNotificationsScreen() {
  const { session } = useAuth();
  const debug = useNotificationDebug();
  const exitRoute = session ? "/" : "/sign-in";

  return (
    <ScreenShell subtitle="Temporary diagnostics" title="Debug Notifications">
      <View style={styles.actions}>
        <Pressable onPress={() => router.replace(exitRoute)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonLabel}>Close</Text>
        </Pressable>
      </View>

      <SurfaceCard tone="white">
        <Text style={styles.label}>User ID</Text>
        <Text selectable style={styles.value}>{session?.user.id ?? "No signed-in user"}</Text>
      </SurfaceCard>

      <SurfaceCard tone="white">
        <Text style={styles.label}>Permission Status</Text>
        <Text selectable style={styles.value}>{debug.permissionStatus}</Text>
      </SurfaceCard>

      <SurfaceCard tone="white">
        <Text style={styles.label}>EAS Project ID</Text>
        <Text selectable style={styles.value}>{debug.projectId ?? "Missing"}</Text>
      </SurfaceCard>

      <SurfaceCard tone="white">
        <Text style={styles.label}>Expo Push Token</Text>
        <Text selectable style={styles.value}>{debug.expoPushToken ?? "Not fetched"}</Text>
      </SurfaceCard>

      <SurfaceCard tone="white">
        <Text style={styles.label}>Token Save Status</Text>
        <Text selectable style={styles.value}>{debug.tokenSaveStatus}</Text>
      </SurfaceCard>

      <SurfaceCard tone="white">
        <Text style={styles.label}>Token Save Error</Text>
        <Text selectable style={styles.value}>{debug.tokenSaveError ?? "None"}</Text>
      </SurfaceCard>

      <SurfaceCard tone="white">
        <Text style={styles.label}>Last Event</Text>
        <Text selectable style={styles.value}>{debug.lastEvent ?? "None"}</Text>
      </SurfaceCard>

      <Pressable onPress={() => router.replace(exitRoute)} style={styles.button}>
        <Text style={styles.buttonLabel}>Close Debug Screen</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginBottom: tokens.spacing.md
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.color.textMuted
  },
  value: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: tokens.color.text
  },
  button: {
    minHeight: 54,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.secondaryContainer
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.color.secondary
  },
  secondaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.surfaceContainerLow
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.color.text
  }
});
