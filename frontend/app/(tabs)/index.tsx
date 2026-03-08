import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
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
  const { previewBuilding, previewSite, setPreviewSite, clearSelection } = useMapStore();
  const { mapSearchQuery, setMapSearch, activeMapCategory } = useFilterStore();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [unverifiedPlace, setUnverifiedPlace] = useState<PlaceDetail | null>(null);
  const [selectingPlace, setSelectingPlace] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [previewSiteName, setPreviewSiteName] = useState("");
  const [showUserLocation, setShowUserLocation] = useState(false);

  useEffect(() => {
    if (activeMapCategory !== "Near me") {
      setShowUserLocation(false);
      return;
    }
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setShowUserLocation(true);
      mapRef.current?.animateToRegion(
        {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600
      );
    })();
  }, [activeMapCategory]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(mapSearchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [mapSearchQuery]);

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
      const site = await sitesService.getById(id);
      if (thisPress !== pinPressId.current) return;
      setUnverifiedPlace(null);
      setPreviewSiteName(site.name);
      setPreviewSite(site);
    } catch (error) {
      console.error("Failed to load site:", error);
    } finally {
      if (thisPress === pinPressId.current) setPinLoading(false);
    }
  };

  const handlePredictionPress = async (prediction: PlacePrediction) => {
    const thisPress = ++pinPressId.current;
    setMapSearch("");
    setPredictions([]);
    setSelectingPlace(true);

    try {

      const detail = await placesService.getDetails(prediction.placeId);
      if (!detail) return;

      mapRef.current?.animateToRegion(
        {
          latitude: detail.latitude,
          longitude: detail.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );

      const MATCH_THRESHOLD_DEG = 0.00135;
      const dbResults = await sitesService.nearby(detail.latitude, detail.longitude);
      const dbMatch = dbResults.reduce<(typeof dbResults)[0] | null>((closest, s) => {
        const dist = Math.hypot((s.lat ?? 0) - detail.latitude, (s.lng ?? 0) - detail.longitude);
        if (dist > MATCH_THRESHOLD_DEG) return closest;
        if (!closest) return s;
        const closestDist = Math.hypot((closest.lat ?? 0) - detail.latitude, (closest.lng ?? 0) - detail.longitude);
        return dist < closestDist ? s : closest;
      }, null);

      if (dbMatch) {
        const fullSite = await sitesService.getById(dbMatch.id);
        if (thisPress !== pinPressId.current) return;
        setUnverifiedPlace(null);
        setPreviewSiteName(fullSite.name);
        setPreviewSite(fullSite);
      } else {

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
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={(region) => clampRegion(region, mapRef)}
      >
        {filteredGeojson != null && (filteredGeojson.features?.length ?? 0) > 0 && (
          <BuildingPins geojson={filteredGeojson} onPinPress={handlePinPress} />
        )}
        {unverifiedPlace && (
          <Marker
            coordinate={{
              latitude: unverifiedPlace.latitude,
              longitude: unverifiedPlace.longitude,
            }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => {}}
          >
            <View style={styles.grayPin}>
              <Text style={styles.grayPinLabel} numberOfLines={1}>
                {unverifiedPlace.name}
              </Text>
            </View>
          </Marker>
        )}
      </MapView>
      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.sm }]}>
        <MapSearchBar />
        <CategoryChipRow />
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
        {predictionsLoading && debouncedQuery.length > 1 && predictions.length === 0 && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        {(pinLoading || selectingPlace) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        {activeMapCategory && activeMapCategory !== "Near me" &&
          filteredGeojson != null && (filteredGeojson.features?.length ?? 0) === 0 && (
          <View style={styles.loadingRow}>
            <Text variant="caption" color={Colors.textSecondary}>
              No {activeMapCategory.toLowerCase()} buildings in the database yet
            </Text>
          </View>
        )}
      </View>
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
