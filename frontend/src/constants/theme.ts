export const Colors = {
  primary: "#1D3D2F",
  primaryLight: "#2A5240",
  primaryDark: "#142B21",
  background: "#F0EDE8",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textOnPrimary: "#FFFFFF",
  border: "#E8E4DF",

  fullyAccessible: "#1D3D2F",
  partiallyAccessible: "#F59E0B",
  notAccessible: "#EF4444",

  open: "#1D3D2F",
  closed: "#EF4444",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const FontFamily = {
  heading: "DMSerifDisplay_400Regular",
  body: "Inter_400Regular",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

export const FontSize = {
  display: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  bodySm: 14,
  label: 12,
  caption: 11,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
} as const;

export const Shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
