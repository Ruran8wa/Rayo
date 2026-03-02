import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import type { Building } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  Health: "medical",
  Government: "business",
  Bank: "card",
  Education: "school",
  default: "location",
};

interface Props {
  building: Building;
}

export function BuildingCard({ building }: Props) {
  const router = useRouter();
  const icon = CATEGORY_ICONS[building.category] ?? CATEGORY_ICONS.default;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/building/${building.id}`)}
    >
      <View style={styles.icon}>
        <Ionicons name={icon as any} size={22} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="bodySm" bold style={styles.name}>{building.name}</Text>
          <View style={styles.statusBadge}>
            <Text variant="caption" color={building.is_open ? Colors.open : Colors.closed}>
              {building.is_open ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
        <Text variant="caption" color={Colors.textSecondary}>
          {building.address} · {building.floor_count} floors
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.features}>
            {(building.features ?? []).slice(0, 2).map((f) => (
              <View key={f} style={styles.featureTag}>
                <Text variant="caption" color={Colors.textSecondary}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.right}>
            <AccessibilityBadge level={building.accessibility_level} />
            {building.distance_km && (
              <Text variant="caption" color={Colors.textSecondary}>
                {building.distance_km} km
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadow.card,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { flex: 1, marginRight: Spacing.sm },
  statusBadge: {},
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.sm },
  features: { flexDirection: "row", gap: Spacing.xs },
  featureTag: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  right: { gap: Spacing.xs, alignItems: "flex-end" },
});
