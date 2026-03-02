import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@components/ui/text";
import { FloorCard } from "@components/buildings/floor-card";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import { buildingsService } from "@services/api/buildings.service";

const { width: W } = Dimensions.get("window");

export default function BuildingDetail() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: building, isLoading, isError } = useQuery({
    queryKey: ["building", id],
    queryFn: () => buildingsService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !building) {
    return (
      <View style={styles.loading}>
        <Text variant="body" color={Colors.textSecondary}>Could not load building details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark green header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <Text variant="h1" color={Colors.white} style={styles.name}>
          {building.name}
        </Text>
        <Text variant="bodySm" color={Colors.white + "B3"} style={styles.address}>
          {building.address}
        </Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons name="time-outline" size={12} color={Colors.white} />
            <Text variant="caption" color={Colors.white}>
              {building.is_open ? "Open now" : "Closed"}
            </Text>
          </View>
          {building.floor_count > 0 && (
            <View style={styles.chip}>
              <Text variant="caption" color={Colors.white}>{building.floor_count} floors</Text>
            </View>
          )}
          {building.distance_km != null && (
            <View style={styles.chip}>
              <Text variant="caption" color={Colors.white}>{building.distance_km} km</Text>
            </View>
          )}
        </View>
      </View>

      {/* Floors section */}
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
          snapToInterval={W - Spacing.xl}
          decelerationRate="fast"
          contentContainerStyle={styles.floorsList}
          ListEmptyComponent={
            <View style={[styles.emptyFloors, { width: W - Spacing.xl * 2 }]}>
              <Ionicons name="layers-outline" size={32} color={Colors.border} />
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.emptyText}>
                No floor data available yet.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.white + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
    alignSelf: "flex-start",
  },
  name: {
    marginBottom: Spacing.xs,
  },
  address: {
    marginBottom: Spacing.base,
  },
  chips: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.white + "40",
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  // Floors
  floorsSection: { flex: 1, paddingTop: Spacing.xl },
  floorsLabel: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
    letterSpacing: 0.8,
  },
  floorsList: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  emptyFloors: {
    marginHorizontal: Spacing.base,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  emptyText: {
    textAlign: "center",
  },
});
