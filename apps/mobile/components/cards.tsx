import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@kinderquest/ui";

export function GradientHero({
  eyebrow,
  title,
  subtitle,
  children
}: PropsWithChildren<{ eyebrow?: string; title: string; subtitle?: string }>) {
  return (
    <View style={styles.hero}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function SurfaceCard({ children, tone = "white" }: PropsWithChildren<{ tone?: "white" | "blue" | "green" }>) {
  return <View style={[styles.card, toneStyles[tone]]}>{children}</View>;
}

export function Pill({ label, tone = "yellow" }: { label: string; tone?: "yellow" | "orange" | "green" | "blue" }) {
  return (
    <View style={[styles.pill, pillStyles[tone]]}>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

export function ActionButton({
  label,
  icon,
  quiet = false,
  onPress
}: {
  label: string;
  icon?: ReactNode;
  quiet?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, quiet && styles.actionButtonQuiet]}>
      {icon}
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: tokens.radius.xlarge,
    padding: 28,
    gap: 10,
    backgroundColor: "#dcedef"
  },
  eyebrow: {
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: tokens.color.textSoft
  },
  heroTitle: {
    fontSize: 54,
    lineHeight: 58,
    fontWeight: "900",
    color: tokens.color.text
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 24,
    color: tokens.color.textMuted
  },
  card: {
    borderRadius: tokens.radius.large,
    padding: 20,
    gap: 14,
    ...tokens.shadow.soft
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  actionButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: tokens.color.primaryContainer
  },
  actionButtonQuiet: {
    backgroundColor: tokens.color.surfaceContainerLow
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.color.text
  }
});

const toneStyles = StyleSheet.create({
  white: {
    backgroundColor: tokens.color.white
  },
  blue: {
    backgroundColor: tokens.color.surfaceContainer
  },
  green: {
    backgroundColor: "#e6f8df"
  }
});

const pillStyles = StyleSheet.create({
  yellow: {
    backgroundColor: tokens.color.primaryContainer
  },
  orange: {
    backgroundColor: "#ffd8b0"
  },
  green: {
    backgroundColor: "#d8f7d3"
  },
  blue: {
    backgroundColor: tokens.color.secondaryContainer
  }
});
