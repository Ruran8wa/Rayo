import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { Colors, FontFamily, FontSize } from "@constants/theme";

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
  const isHeading = ["display", "h1", "h2", "h3"].includes(variant);
  const fontFamily = isHeading
    ? FontFamily.heading
    : bold
      ? FontFamily.bodyBold
      : semiBold
        ? FontFamily.bodySemiBold
        : FontFamily.body;

  return (
    <RNText
      style={[
        styles.base,
        { fontFamily, fontSize: FontSize[variant], color },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
