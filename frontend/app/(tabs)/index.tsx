import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildingsService } from "@services/api/buildings.service";
import { useMapStore } from "@stores/map.store";
import { MapSearchBar } from "@components/map/map-search-bar";
import { CategoryChipRow } from "@components/map/category-chip-row";
import { BuildingPins } from "@components/map/building-pins";
import { BuildingPreviewSheet } from "@components/map/building-preview-sheet";
import { Spacing } from "@constants/theme";

const KIGALI_BOUNDS = { south: -2.0, west: 29.9, north: -1.8, east: 30.2 } as const;

const INITIAL_REGION = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.05,
  longitudeDelta: 0.03,
};

export default function MapTab() {
  const insets = useSafeAreaInsets();
  const { previewBuilding, setSelectedBuilding, clearSelection } = useMapStore();

  const { data: geojson } = useQuery({
    queryKey: ["buildings-geojson"],
    queryFn: () => buildingsService.getGeoJSON(KIGALI_BOUNDS),
  });

  const handlePinPress = async (id: string) => {
    try {
      const building = await buildingsService.getById(id);
      setSelectedBuilding(building);
    } catch (error) {
      console.error("Failed to load building:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {geojson && (
          <BuildingPins geojson={geojson} onPinPress={handlePinPress} />
        )}
      </MapView>

      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.sm }]}>
        <MapSearchBar />
        <CategoryChipRow />
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
});
