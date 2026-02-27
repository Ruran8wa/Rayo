import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Service } from "@/types";

interface Props {
  service: Service;
}

export function ServiceRow({ service }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text variant="bodySm" bold>{service.name}</Text>
        <Text variant="caption" color={Colors.textSecondary}>
          {service.features.join(" · ")}
        </Text>
      </View>
      <AccessibilityBadge level={service.accessibility_level} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
});
