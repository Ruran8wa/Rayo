import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import { Text } from "./text";

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.active : styles.inactive]}
    >
      <Text
        variant="label"
        color={active ? Colors.white : Colors.textPrimary}
        semiBold
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.pill,
    marginRight: Spacing.sm,
    borderWidth: 1.5,
  },
  active: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  inactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
});
