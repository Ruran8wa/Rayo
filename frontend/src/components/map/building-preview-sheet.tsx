import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Button } from "@components/ui/button";
import { SimpleSheet } from "@components/ui/simple-sheet";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Building } from "@/types";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const FEATURE_ICONS: Record<string, IoniconName> = {
  elevator: "arrow-up-circle-outline",
  lift: "arrow-up-circle-outline",
  ramp: "trending-up-outline",
  signs: "text-outline",
  braille: "ellipsis-horizontal-circle-outline",
  "wide door": "expand-outline",
  "grab bar": "remove-outline",
  parking: "car-outline",
  handrail: "remove-outline",
};

function featureIcon(name: string): IoniconName {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(FEATURE_ICONS)) {
    if (key.includes(k)) return v;
  }
  return "checkmark-circle-outline";
}

interface Props {
  building: Building | null;
  onClose: () => void;
}

export function BuildingPreviewSheet({ building, onClose }: Props) {
  const router = useRouter();

  return (
    <SimpleSheet visible={building != null} onClose={onClose}>
      {building && (
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text variant="h2">{building.name}</Text>
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.address}>
                {building.address}
                {building.distance_km ? ` · ${building.distance_km} km away` : ""}
              </Text>
            </View>
            <AccessibilityBadge level={building.accessibility_level} />
          </View>

          {building.features.length > 0 && (
            <View style={styles.features}>
              {building.features.slice(0, 3).map((f) => (
                <View key={f} style={styles.featureTag}>
                  <Ionicons name={featureIcon(f)} size={12} color={Colors.textSecondary} />
                  <Text variant="caption" color={Colors.textSecondary}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          <Button
            label="View floors & services →"
            onPress={() => {
              onClose();
              router.push(`/building/${building.id}`);
            }}
            fullWidth
            style={styles.btn}
          />
        </View>
      )}
    </SimpleSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing.lg },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  info: { flex: 1, marginRight: Spacing.base },
  address: { marginTop: Spacing.xs },
  features: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.md },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btn: { marginTop: Spacing.base },
});
