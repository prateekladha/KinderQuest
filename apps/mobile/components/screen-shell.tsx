import type { PropsWithChildren, ReactNode, RefObject } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@kinderquest/ui";

export function ScreenShell({
  title,
  subtitle,
  headerRight,
  children,
  scrollRef,
  onRefresh,
  refreshing = false
}: PropsWithChildren<{
  title?: ReactNode;
  subtitle?: string;
  headerRight?: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
}>) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh
            ? <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={tokens.color.secondary} />
            : undefined
        }
        contentContainerStyle={[styles.content, isTablet && styles.contentTablet] satisfies ScrollViewProps["contentContainerStyle"]}
      >
        {(title || subtitle || headerRight) && (
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              {typeof title === "string"
                ? <Text style={[styles.title, isTablet && styles.titleTablet]}>{title}</Text>
                : title}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {headerRight ? <View>{headerRight}</View> : null}
          </View>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionHeading({
  title,
  rightLabel
}: {
  title: string;
  rightLabel?: string;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rightLabel ? <Text style={styles.sectionLink}>{rightLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.color.surface
  },
  content: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg
  },
  contentTablet: {
    paddingHorizontal: tokens.spacing.xl
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  headerCopy: {
    flex: 1,
    gap: 6
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: tokens.color.text
  },
  titleTablet: {
    fontSize: 44,
    lineHeight: 48
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: tokens.color.textMuted
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    color: tokens.color.text
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.secondary
  }
});
