import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { tokens } from "@kinderquest/ui";

export function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={tokens.color.secondary} size="large" />
      <Text style={styles.label}>Loading KinderQuest...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: tokens.color.surface
  },
  label: {
    fontSize: 16,
    color: tokens.color.textMuted
  }
});
