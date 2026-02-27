import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Building } from "@/types";

interface Props {
  building: Building | null;
  onClose: () => void;
}

export function BuildingPreviewSheet({ building, onClose }: Props) {
  const router = useRouter();
  const snapPoints = useMemo(() => ["28%"], []);

  const handleViewDetail = () => {
    if (!building) return;
    router.push(`/building/${building.id}`);
  };

  if (!building) return null;

  return (
    <BottomSheet
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
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
                <Text variant="caption" color={Colors.textSecondary}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        <Button
          label="View floors & services →"
          onPress={handleViewDetail}
          fullWidth
          style={styles.btn}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl },
  handle: { backgroundColor: Colors.border, width: 36 },
  content: { padding: Spacing.xl },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  info: { flex: 1, marginRight: Spacing.base },
  address: { marginTop: Spacing.xs },
  features: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.md },
  featureTag: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btn: { marginTop: Spacing.base },
});
