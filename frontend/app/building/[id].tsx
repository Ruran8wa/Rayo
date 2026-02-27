import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Text } from "@components/ui/text";
import { FloorCard } from "@components/buildings/floor-card";
import { Colors, Spacing } from "@constants/theme";
import { buildingsService } from "@services/api/buildings.service";

export default function BuildingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: building, isLoading } = useQuery({
    queryKey: ["building", id],
    queryFn: () => buildingsService.getById(id),
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!building) return null;

  return (
    <View style={styles.container}>
      {/* Dark green header */}
      <SafeAreaView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text variant="h1" color={Colors.white} style={styles.name}>{building.name}</Text>
        <Text variant="bodySm" color={Colors.white + "CC"} style={styles.address}>
          {building.address}
        </Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text variant="caption" color={Colors.white}>
              {building.is_open ? "Open now" : "Closed"}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text variant="caption" color={Colors.white}>{building.floor_count} floors</Text>
          </View>
          {building.distance_km && (
            <View style={styles.badge}>
              <Text variant="caption" color={Colors.white}>{building.distance_km} km</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Floors */}
      <View style={styles.floorsSection}>
        <Text variant="label" color={Colors.textSecondary} semiBold style={styles.floorsLabel}>
          FLOORS — SWIPE TO EXPLORE
        </Text>
        <FlatList
          data={building.floors ?? []}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => <FloorCard floor={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.floorsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  back: { padding: Spacing.sm, marginLeft: -Spacing.sm, marginBottom: Spacing.base },
  name: { marginBottom: Spacing.xs },
  address: { marginBottom: Spacing.base },
  badges: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  badge: {
    borderWidth: 1,
    borderColor: Colors.white + "40",
    borderRadius: 100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  floorsSection: { flex: 1, paddingTop: Spacing.xl },
  floorsLabel: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base, letterSpacing: 0.8 },
  floorsList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
});
