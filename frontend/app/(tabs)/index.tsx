import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildingsService } from "@services/api/buildings.service";
import { placesService, type PlaceDetail, type PlacePrediction } from "@services/api/places.service";
import { sitesService } from "@services/api/sites.service";
import { useMapStore } from "@stores/map.store";
import { useFilterStore } from "@stores/filter.store";
import { MapSearchBar } from "@components/map/map-search-bar";
import { CategoryChipRow } from "@components/map/category-chip-row";
import { BuildingPins } from "@components/map/building-pins";
import { BuildingPreviewSheet } from "@components/map/building-preview-sheet";
import { SitePreviewSheet } from "@components/map/site-preview-sheet";
import { UnverifiedPlaceSheet } from "@components/map/unverified-place-sheet";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";

const KIGALI_BOUNDS = { south: -2.0, west: 29.9, north: -1.8, east: 30.2 } as const;

/** Snap the map back inside Kigali bounds if the user pans outside. */
function clampRegion(region: Region, mapRef: React.RefObject<MapView | null>): void {
  const lat = Math.max(KIGALI_BOUNDS.south, Math.min(KIGALI_BOUNDS.north, region.latitude));
  const lng = Math.max(KIGALI_BOUNDS.west, Math.min(KIGALI_BOUNDS.east, region.longitude));
  if (lat !== region.latitude || lng !== region.longitude) {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta },
      300
    );
  }
}

const INITIAL_REGION = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.05,
  longitudeDelta: 0.03,
};

export default function MapTab() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const pinPressId = useRef(0);
  const { previewBuilding, previewSite, setSelectedBuilding, setPreviewSite, clearSelection } = useMapStore();
  const { mapSearchQuery, setMapSearch, activeMapCategory } = useFilterStore();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [unverifiedPlace, setUnverifiedPlace] = useState<PlaceDetail | null>(null);
  const [selectingPlace, setSelectingPlace] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [previewSiteName, setPreviewSiteName] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(mapSearchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [mapSearchQuery]);

  // Fetch Google Places autocomplete predictions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setPredictions([]);
      return;
    }
    setPredictionsLoading(true);
    placesService
      .autocomplete(debouncedQuery)
      .then(setPredictions)
      .catch(() => setPredictions([]))
      .finally(() => setPredictionsLoading(false));
  }, [debouncedQuery]);

  const { data: geojson } = useQuery({
    queryKey: ["buildings-geojson"],
    queryFn: () => buildingsService.getGeoJSON(KIGALI_BOUNDS),
  });

  // Filter pins by active category chip (case-insensitive keyword match against site_type)
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    Health:     ["health", "hospital", "medical", "clinic", "pharmacy"],
    Government: ["government", "gov", "municipal", "public", "ministry"],
    Bank:       ["bank", "finance", "financial", "atm"],
    Education:  ["education", "school", "university", "college", "institute", "academic"],
    Commercial: ["commercial", "retail", "market", "mall", "shop", "business"],
  };

  const filteredGeojson = useMemo(() => {
    if (!geojson) return geojson;
    if (!activeMapCategory || activeMapCategory === "Near me") return geojson;
    const keywords = CATEGORY_KEYWORDS[activeMapCategory] ?? [];
    return {
      ...geojson,
      features: geojson.features.filter((f) => {
        const cat = (f.properties.category ?? "").toLowerCase();
        return keywords.some((kw) => cat.includes(kw));
      }),
    };
  }, [geojson, activeMapCategory]);

  const handlePinPress = async (id: string) => {
    const thisPress = ++pinPressId.current;
    setPinLoading(true);
    try {
      const building = await buildingsService.getById(id);
      if (thisPress !== pinPressId.current) return;
      setUnverifiedPlace(null);
      if (building.site_id) {
        const site = await sitesService.getById(building.site_id);
        if (thisPress !== pinPressId.current) return;
        setPreviewSiteName(site.name);
        setPreviewSite(site);
      } else {
        setSelectedBuilding(building);
      }
    } catch (error) {
      console.error("Failed to load building:", error);
    } finally {
      if (thisPress === pinPressId.current) setPinLoading(false);
    }
  };

  const handlePredictionPress = async (prediction: PlacePrediction) => {
    setMapSearch("");
    setPredictions([]);
    setSelectingPlace(true);

    try {
      // 1. Get coordinates from Google
      const detail = await placesService.getDetails(prediction.placeId);
      if (!detail) return;

      // 2. Pan the map to the place
      mapRef.current?.animateToRegion(
        {
          latitude: detail.latitude,
          longitude: detail.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );

      // 3. Check if it exists in our database
      const dbResults = await buildingsService.nearby(detail.latitude, detail.longitude);
      const dbMatch = dbResults.reduce<(typeof dbResults)[0] | null>((closest, b) => {
        const dist = Math.hypot(b.latitude - detail.latitude, b.longitude - detail.longitude);
        if (!closest) return b;
        const closestDist = Math.hypot(closest.latitude - detail.latitude, closest.longitude - detail.longitude);
        return dist < closestDist ? b : closest;
      }, null);

      if (dbMatch) {
        const full = await buildingsService.getById(dbMatch.id);
        if (full.site_id) {
          const site = await sitesService.getById(full.site_id);
          setUnverifiedPlace(null);
          setPreviewSiteName(site.name);
          setPreviewSite(site);
        } else {
          setUnverifiedPlace(null);
          setSelectedBuilding(full);
        }
      } else {
        // Not in our system — show gray unverified pin + sheet
        clearSelection();
        setUnverifiedPlace(detail);
      }
    } catch (error) {
      console.error("Failed to resolve prediction:", error);
    } finally {
      setSelectingPlace(false);
    }
  };

  const handleClearUnverified = () => {
    setUnverifiedPlace(null);
    clearSelection();
  };

  const handleClearSite = () => {
    setPreviewSiteName("");
    clearSelection();
  };

  const showPredictions = predictions.length > 0 && !selectingPlace;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        minZoomLevel={11}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={(region) => clampRegion(region, mapRef)}
      >
        {filteredGeojson != null && (filteredGeojson.features?.length ?? 0) > 0 && (
          <BuildingPins geojson={filteredGeojson} onPinPress={handlePinPress} />
        )}

        {/* Gray pin for unverified Google place */}
        {unverifiedPlace && (
          <Marker
            coordinate={{
              latitude: unverifiedPlace.latitude,
              longitude: unverifiedPlace.longitude,
            }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => {}} // keep sheet open
          >
            <View style={styles.grayPin}>
              <Text style={styles.grayPinLabel} numberOfLines={1}>
                {unverifiedPlace.name}
              </Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Overlay: search bar, chips, results */}
      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.sm }]}>
        <MapSearchBar />
        <CategoryChipRow />

        {/* Predictions dropdown */}
        {showPredictions && (
          <View style={styles.resultsCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.resultsList}
            >
              {predictions.map((p, i) => (
                <Pressable
                  key={p.placeId}
                  style={[
                    styles.resultRow,
                    i < predictions.length - 1 && styles.resultBorder,
                  ]}
                  onPress={() => handlePredictionPress(p)}
                >
                  <View style={styles.pinIcon}>
                    <Text style={styles.pinIconText}>📍</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text variant="bodySm" semiBold numberOfLines={1}>{p.name}</Text>
                    <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                      {p.address}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Loading spinner while selecting from autocomplete */}
        {predictionsLoading && debouncedQuery.length > 1 && predictions.length === 0 && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}

        {/* Loading spinner while a pin is loading */}
        {(pinLoading || selectingPlace) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}

        {/* Empty state when active category filter has no buildings */}
        {activeMapCategory && activeMapCategory !== "Near me" &&
          filteredGeojson != null && (filteredGeojson.features?.length ?? 0) === 0 && (
          <View style={styles.loadingRow}>
            <Text variant="caption" color={Colors.textSecondary}>
              No {activeMapCategory.toLowerCase()} buildings in the database yet
            </Text>
          </View>
        )}
      </View>

      {/* Bottom sheets — only one shows at a time */}
      <BuildingPreviewSheet
        building={previewBuilding}
        onClose={clearSelection}
      />
      <SitePreviewSheet
        site={previewSite}
        placeName={previewSiteName}
        onClose={handleClearSite}
      />
      <UnverifiedPlaceSheet
        place={unverifiedPlace}
        onClose={handleClearUnverified}
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
  pinIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pinIconText: {
    fontSize: 16,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  loadingRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: "center",
    ...Shadow.card,
  },
  // Gray unverified pin
  grayPin: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    backgroundColor: "#9E9E9E",
    maxWidth: 140,
  },
  grayPinLabel: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: "600",
  },
});
