import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { Colors, FontFamily, FontSize } from "@constants/theme";
import { useTextSize } from "@contexts/TextSizeContext";

const LARGE_TEXT_SCALE = 1.2;

interface Props extends TextProps {
  variant?: "display" | "h1" | "h2" | "h3" | "body" | "bodySm" | "label" | "caption";
  color?: string;
  semiBold?: boolean;
  bold?: boolean;
}

export function Text({
  variant = "body",
  color = Colors.textPrimary,
  semiBold,
  bold,
  style,
  ...props
}: Props) {
  const { largeText } = useTextSize();
  const isHeading = ["display", "h1", "h2", "h3"].includes(variant);
  const fontFamily = isHeading
    ? FontFamily.heading
    : bold
      ? FontFamily.bodyBold
      : semiBold
        ? FontFamily.bodySemiBold
        : FontFamily.body;

  const fontSize = largeText
    ? Math.round(FontSize[variant] * LARGE_TEXT_SCALE)
    : FontSize[variant];

  return (
    <RNText
      style={[styles.base, { fontFamily, fontSize, color }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
