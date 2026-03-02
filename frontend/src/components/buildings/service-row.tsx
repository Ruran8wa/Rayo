import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Service } from "@/types";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface ServiceIcon {
  icon: IoniconName;
  color: string;
}

function getServiceIcon(name: string): ServiceIcon {
  const n = name.toLowerCase();
  if (n.includes("emergency") || n.includes("first aid") || n.includes("trauma"))
    return { icon: "medical", color: "#3B82F6" };
  if (n.includes("pharmacy") || n.includes("dispensary") || n.includes("drug"))
    return { icon: "medical-outline", color: "#F97316" };
  if (n.includes("restroom") || n.includes("toilet") || n.includes("wc") || n.includes("bathroom"))
    return { icon: "people-outline", color: "#EC4899" };
  if (n.includes("elevator") || n.includes("lift"))
    return { icon: "arrow-up-circle-outline", color: "#8B5CF6" };
  if (n.includes("registration") || n.includes("reception") || n.includes("desk") || n.includes("admin"))
    return { icon: "document-text-outline", color: "#1D3D2F" };
  if (n.includes("parking") || n.includes("garage"))
    return { icon: "car-outline", color: "#0EA5E9" };
  if (n.includes("atm") || n.includes("bank") || n.includes("cash") || n.includes("teller"))
    return { icon: "card-outline", color: "#059669" };
  if (n.includes("cafeteria") || n.includes("restaurant") || n.includes("food") || n.includes("canteen"))
    return { icon: "restaurant-outline", color: "#EAB308" };
  if (n.includes("lab") || n.includes("laboratory"))
    return { icon: "flask-outline", color: "#6366F1" };
  if (n.includes("ward") || n.includes("room") || n.includes("unit"))
    return { icon: "bed-outline", color: "#14B8A6" };
  return { icon: "grid-outline", color: Colors.textSecondary };
}

interface Props {
  service: Service;
}

export function ServiceRow({ service }: Props) {
  const { icon, color } = getServiceIcon(service.name);
  const featuresText = (service.features ?? [])
    .map((f) => `${f} ✓`)
    .join("  ·  ");

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.info}>
        <Text variant="bodySm" semiBold>{service.name}</Text>
        {(service.features ?? []).length > 0 && (
          <Text variant="caption" color={Colors.textSecondary} style={styles.features}>
            {featuresText}
          </Text>
        )}
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1, gap: 2 },
  features: { lineHeight: 16 },
});
