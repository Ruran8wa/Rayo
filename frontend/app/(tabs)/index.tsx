import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildingsService } from "@services/api/buildings.service";
import { useMapStore } from "@stores/map.store";
import { useFilterStore } from "@stores/filter.store";
import { MapSearchBar } from "@components/map/map-search-bar";
import { CategoryChipRow } from "@components/map/category-chip-row";
import { BuildingPins } from "@components/map/building-pins";
import { BuildingPreviewSheet } from "@components/map/building-preview-sheet";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import type { Building } from "@/types";

const KIGALI_BOUNDS = { south: -2.0, west: 29.9, north: -1.8, east: 30.2 } as const;

const INITIAL_REGION = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.05,
  longitudeDelta: 0.03,
};

export default function MapTab() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { previewBuilding, setSelectedBuilding, clearSelection } = useMapStore();
  const { mapSearchQuery, setMapSearch } = useFilterStore();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(mapSearchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [mapSearchQuery]);

  const { data: geojson } = useQuery({
    queryKey: ["buildings-geojson"],
    queryFn: () => buildingsService.getGeoJSON(KIGALI_BOUNDS),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["map-search", debouncedQuery],
    queryFn: () => buildingsService.search(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  const handlePinPress = async (id: string) => {
    try {
      const building = await buildingsService.getById(id);
      setSelectedBuilding(building);
    } catch (error) {
      console.error("Failed to load building:", error);
    }
  };

  const handleResultPress = (building: Building) => {
    setSelectedBuilding(building);
    setMapSearch("");
    mapRef.current?.animateToRegion(
      {
        latitude: building.latitude,
        longitude: building.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  const showResults =
    debouncedQuery.length > 1 && searchResults && searchResults.length > 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {geojson?.features?.length && (
          <BuildingPins geojson={geojson} onPinPress={handlePinPress} />
        )}
      </MapView>

      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.sm }]}>
        <MapSearchBar />
        <CategoryChipRow />
        {showResults && (
          <View style={styles.resultsCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.resultsList}
            >
              {searchResults.map((building, i) => (
                <Pressable
                  key={building.id}
                  style={[
                    styles.resultRow,
                    i < searchResults.length - 1 && styles.resultBorder,
                  ]}
                  onPress={() => handleResultPress(building)}
                >
                  <View style={styles.resultInfo}>
                    <Text variant="bodySm" semiBold numberOfLines={1}>
                      {building.name}
                    </Text>
                    <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                      {building.address}
                    </Text>
                  </View>
                  <AccessibilityBadge level={building.accessibility_level} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <BuildingPreviewSheet
        building={previewBuilding}
        onClose={clearSelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  resultsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    maxHeight: 280,
    overflow: "hidden",
    ...Shadow.card,
  },
  resultsList: {
    paddingVertical: Spacing.xs,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  resultBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
});
