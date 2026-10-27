/**
 * TaskPulse Design System Tokens
 * Inspired by Dieter Rams' 10 Principles of Good Design and Braun industrial design aesthetics.
 * Restrained, calm, functional, with a single signal orange accent (#E8590C).
 */

export const tokens = {
  colors: {
    light: {
      bg: "#F7F6F3", // Warm off-white
      surface: "#FFFFFF",
      sunken: "#EFEEEA",
      border: "#E4E2DC",
      borderHover: "#D0CDC4",
      borderStrong: "#B8B5AB",
      textPrimary: "#1A1A18",
      textSecondary: "#6B6A65",
      textTertiary: "#9C9A93",
      accent: "#E8590C", // Signal orange
      accentHover: "#D14F0A",
      accentSubtle: "rgba(232, 89, 12, 0.08)",
      accentBorder: "rgba(232, 89, 12, 0.3)",
      // Semantic status (desaturated)
      statusSuccess: "#2E7D32",
      statusSuccessBg: "#E8F5E9",
      statusWarning: "#ED6C02",
      statusWarningBg: "#FFF3E0",
      statusDanger: "#D32F2F",
      statusDangerBg: "#FFEBEE",
      statusNeutral: "#6B6A65",
      statusNeutralBg: "#EFEEEA",
      selection: "rgba(232, 89, 12, 0.15)",
    },
    dark: {
      bg: "#141413",
      surface: "#1C1C1A",
      sunken: "#181816",
      border: "#2B2B28",
      borderHover: "#3D3D38",
      borderStrong: "#52524C",
      textPrimary: "#ECEAE4",
      textSecondary: "#8E8C85",
      textTertiary: "#5E5D57",
      accent: "#E8590C", // Signal orange
      accentHover: "#F36D26",
      accentSubtle: "rgba(232, 89, 12, 0.14)",
      accentBorder: "rgba(232, 89, 12, 0.4)",
      // Semantic status (desaturated)
      statusSuccess: "#81C784",
      statusSuccessBg: "rgba(46, 125, 50, 0.2)",
      statusWarning: "#FFB74D",
      statusWarningBg: "rgba(237, 108, 2, 0.2)",
      statusDanger: "#E57373",
      statusDangerBg: "rgba(211, 47, 47, 0.2)",
      statusNeutral: "#8E8C85",
      statusNeutralBg: "rgba(255, 255, 255, 0.06)",
      selection: "rgba(232, 89, 12, 0.25)",
    },
  },
  typography: {
    fonts: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      serif: "'Newsreader', Georgia, 'Times New Roman', serif",
      mono: "'JetBrains Mono', 'Geist Mono', SFMono-Regular, Menlo, monospace",
    },
    // Modular scale: 12 / 13 / 14 / 16 / 20 / 28 / 40
    scale: {
      xs: "12px",
      sm: "13px",
      base: "14px",
      md: "16px",
      lg: "20px",
      xl: "28px",
      title: "40px",
    },
    lineHeights: {
      tight: 1.15,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.65,
    },
    tracking: {
      tighter: "-0.03em",
      tight: "-0.02em",
      normal: "0em",
      wide: "0.04em",
      wider: "0.08em",
    },
  },
  spacing: {
    unit: 4, // 4px base
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
    "4xl": "64px",
  },
  radius: {
    xs: "4px",
    sm: "6px", // Controls, buttons, inputs
    md: "8px",
    lg: "10px", // Cards, popovers, modals
    pill: "9999px",
  },
  shadows: {
    // Rams' principle: 1px hairline borders instead of heavy shadows; one soft tier for floating layers
    hairline: "0 0 0 1px var(--border)",
    floating: "0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
    floatingDark: "0 8px 30px -4px rgba(0, 0, 0, 0.45), 0 2px 8px -1px rgba(0, 0, 0, 0.3)",
  },
  motion: {
    durationFast: "150ms",
    durationNormal: "200ms",
    durationSlow: "250ms",
    easing: "cubic-bezier(0.2, 0, 0, 1)", // Smooth ease-out
    pressScale: "scale(0.98)",
  },
  layout: {
    sidebarWidth: 260,
    sidebarRailWidth: 56,
    contextPanelWidth: 320,
    maxReadingWidth: 720,
  },
} as const;

export type ThemeMode = "light" | "dark" | "system";
export type ContentFont = "sans" | "serif" | "mono";
export type DensityMode = "comfortable" | "compact";
