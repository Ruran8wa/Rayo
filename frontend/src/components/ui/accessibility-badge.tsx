import React from "react";
import { StyleSheet, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import { Text } from "./text";

import type { AccessibilityLevel } from "@/types";
export type { AccessibilityLevel };

const CONFIG: Record<AccessibilityLevel, { label: string; color: string }> = {
  fully:   { label: "Fully",   color: Colors.fullyAccessible },
  partial: { label: "Partial", color: Colors.partiallyAccessible },
  none:    { label: "None",    color: Colors.notAccessible },
  unknown: { label: "Unknown", color: "#9E9E9E" },
};

interface Props {
  level: AccessibilityLevel;
}

export function AccessibilityBadge({ level }: Props) {
  const { label, color } = CONFIG[level];
  return (
    <View style={[styles.badge, { backgroundColor: color + "20", borderColor: color }]}>
      <Text variant="caption" color={color} semiBold>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
});
