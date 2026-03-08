import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { SimpleSheet } from "@components/ui/simple-sheet";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Site } from "@/types";

interface Props {
  site: Site | null;
  placeName: string;
  placeAddress?: string;
  onClose: () => void;
}

export function SitePreviewSheet({ site, placeName, placeAddress, onClose }: Props) {
  const router = useRouter();

  return (
    <SimpleSheet visible={site != null} onClose={onClose}>
      {site && (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="h2" numberOfLines={2}>{placeName}</Text>
            {(placeAddress ?? site.address) ? (
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.address}>
                {placeAddress ?? site.address}
              </Text>
            ) : null}
          </View>
          <View style={styles.dbBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.fullyAccessible} />
            <Text variant="caption" color={Colors.fullyAccessible}>
              {site.buildings.length} building{site.buildings.length !== 1 ? "s" : ""} in our system
            </Text>
          </View>
          <ScrollView style={styles.buildingsList} showsVerticalScrollIndicator={false}>
            {site.buildings.map((building, i) => (
              <Pressable
                key={building.id}
                style={[
                  styles.buildingRow,
                  i < site.buildings.length - 1 && styles.buildingBorder,
                ]}
                onPress={() => {
                  onClose();
                  router.push({
                    pathname: "/building/[id]",
                    params: { id: building.id, siteId: site.id, siteName: site.name },
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel={`View ${building.name}`}
              >
                <View style={styles.buildingInfo}>
                  <Text variant="bodySm" semiBold numberOfLines={1}>{building.name}</Text>
                  {building.floor_count > 0 && (
                    <Text variant="caption" color={Colors.textSecondary}>
                      {building.floor_count} floor{building.floor_count !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>
                <AccessibilityBadge level={building.accessibility_level} />
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </SimpleSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  header: { gap: Spacing.xs },
  address: { marginTop: 2 },
  dbBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.fullyAccessible + "12",
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: "flex-start",
  },
  buildingsList: { maxHeight: 240 },
  buildingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  buildingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  buildingInfo: { flex: 1 },
});
