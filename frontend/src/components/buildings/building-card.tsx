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
  Hospital: "medical",
  Clinic: "medical",
  Government: "business",
  Bank: "card",
  Education: "school",
  School: "school",
  University: "school",
  Commercial: "storefront",
  default: "location",
};

interface Props {
  building: Building;
}

export function BuildingCard({ building }: Props) {
  const router = useRouter();
  const icon = CATEGORY_ICONS[building.category] ?? CATEGORY_ICONS.default;

  const subtitle = [
    building.address,
    building.floor_count > 0 ? `${building.floor_count} floor${building.floor_count !== 1 ? "s" : ""}` : "",
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/building/${building.id}`)}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon as any} size={22} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="bodySm" semiBold style={styles.name} numberOfLines={1}>
            {building.name}
          </Text>
          {building.is_open !== undefined && (
            <Text variant="caption" color={building.is_open ? Colors.open : Colors.closed}>
              {building.is_open ? "Open" : "Closed"}
            </Text>
          )}
        </View>

        {subtitle.length > 0 && (
          <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

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
            {building.distance_km != null && (
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: { flex: 1, marginRight: Spacing.sm },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
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
