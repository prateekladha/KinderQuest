export const tokens = {
  color: {
    primary: "#6d5a00",
    primaryContainer: "#fdd400",
    primaryGlow: "#ffe680",
    secondary: "#006384",
    secondaryContainer: "#bfe9ff",
    tertiary: "#0c6a24",
    tertiaryContainer: "#a4fda4",
    surface: "#edf8ff",
    surfaceContainer: "#cbedff",
    surfaceContainerLow: "#dff2ff",
    surfaceContainerHighest: "#b8e3f9",
    text: "#14323e",
    textMuted: "#45606d",
    textSoft: "#6a8694",
    white: "#ffffff",
    success: "#249655",
    warning: "#ff8c37"
  },
  radius: {
    medium: 24,
    large: 32,
    xlarge: 48,
    pill: 999
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    hero: 56
  },
  shadow: {
    soft: {
      shadowColor: "#14323e",
      shadowOpacity: 0.06,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: 12
      },
      elevation: 6
    }
  }
} as const;
