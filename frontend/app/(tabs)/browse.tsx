import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BuildingPreviewSheet } from "@components/map/building-preview-sheet";
import { SitePreviewSheet } from "@components/map/site-preview-sheet";
import { UnverifiedPlaceSheet } from "@components/map/unverified-place-sheet";
import { Chip } from "@components/ui/chip";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from "@constants/theme";
import { buildingsService } from "@services/api/buildings.service";
import {
  placesService,
  type NearbyPlace,
  type PlaceDetail,
  type PlacePrediction,
} from "@services/api/places.service";
import { sitesService } from "@services/api/sites.service";
import { BROWSE_FILTERS, useFilterStore } from "@stores/filter.store";
import type { BrowseFilter } from "@stores/filter.store";
import type { Building, Site } from "@/types";

const KIGALI_DEFAULT = { lat: -1.9441, lng: 30.0619 };

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  Health: "medical",
  Government: "business",
  Bank: "card",
  Education: "school",
  Other: "location",
};

// ─── Nearby place card (Google Places result) ──────────────────────────────

function NearbyPlaceCard({
  place,
  onPress,
}: {
  place: NearbyPlace;
  onPress: () => void;
}) {
  const icon = CATEGORY_ICONS[place.category] ?? "location";
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.cardTitleRow}>
          <Text variant="bodySm" semiBold style={styles.cardName} numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.unknownBadge}>
            <Text variant="caption" color={Colors.textSecondary} semiBold>
              Unknown
            </Text>
          </View>
        </View>
        <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>
          {place.address}
        </Text>
        {place.rating != null && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text variant="caption" color={Colors.textSecondary}>
              {place.rating.toFixed(1)}
              {place.totalRatings ? ` (${place.totalRatings})` : ""}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Main Browse screen ────────────────────────────────────────────────────

export default function Browse() {
  const { browseSearchQuery, setBrowseSearch, activeBrowseFilters, toggleBrowseFilter } =
    useFilterStore();

  const [location, setLocation] = useState(KIGALI_DEFAULT);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [selectingPlace, setSelectingPlace] = useState(false);

  const selectionId = useRef(0);

  // Sheet state — only one open at a time
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [previewBuilding, setPreviewBuilding] = useState<Building | null>(null);
  const [unverifiedPlace, setUnverifiedPlace] = useState<PlaceDetail | null>(null);
  const [previewSite, setPreviewSite] = useState<Site | null>(null);
  const [previewSiteName, setPreviewSiteName] = useState("");

  // Get user location once on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(browseSearchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [browseSearchQuery]);

  // Fetch Google Places autocomplete predictions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setPredictions([]);
      return;
    }
    setPredictionsLoading(true);
    placesService
      .autocomplete(debouncedQuery, location.lat, location.lng)
      .then(setPredictions)
      .catch(() => setPredictions([]))
      .finally(() => setPredictionsLoading(false));
  }, [debouncedQuery, location]);

  // Active category filters (everything except "Near me")
  const activeCategories = activeBrowseFilters.filter((f) => f !== "Near me");

  // Fetch nearby places — refetches when location or active categories change
  const { data: nearbyPlaces = [], isFetching } = useQuery({
    queryKey: ["nearby", location.lat, location.lng, activeCategories.slice().sort().join(",")],
    queryFn: () =>
      placesService.nearbySearch(
        location.lat,
        location.lng,
        activeCategories.length > 0 ? activeCategories : undefined
      ),
    staleTime: 1000 * 60 * 5,
  });

  // Tap a nearby card — show the simple place detail sheet
  const handleCardPress = (place: NearbyPlace) => {
    setPreviewBuilding(null);
    setUnverifiedPlace(null);
    setPreviewSite(null);
    setPreviewSiteName("");
    setSelectedPlace(place);
  };

  // Tap an autocomplete prediction — check DB, show the right sheet
  const handlePredictionPress = async (prediction: PlacePrediction) => {
    const thisSelection = ++selectionId.current;
    setBrowseSearch("");
    setPredictions([]);
    setSelectingPlace(true);

    try {
      const detail = await placesService.getDetails(prediction.placeId);
      if (!detail || thisSelection !== selectionId.current) return;

      const dbResults = await buildingsService.search(prediction.name);
      if (thisSelection !== selectionId.current) return;

      const dbMatch = dbResults.find((b) => {
        const latClose = Math.abs(b.latitude - detail.latitude) < 0.015;
        const lngClose = Math.abs(b.longitude - detail.longitude) < 0.015;
        return latClose && lngClose;
      });

      setSelectedPlace(null);
      if (dbMatch) {
        const full = await buildingsService.getById(dbMatch.id);
        if (thisSelection !== selectionId.current) return;
        if (full.site_id) {
          const site = await sitesService.getById(full.site_id);
          if (thisSelection !== selectionId.current) return;
          setUnverifiedPlace(null);
          setPreviewSiteName(site.name);
          setPreviewBuilding(null);
          setPreviewSite(site);
        } else {
          setUnverifiedPlace(null);
          setPreviewBuilding(full);
          setPreviewSite(null);
        }
      } else {
        setPreviewBuilding(null);
        setPreviewSite(null);
        setUnverifiedPlace(detail);
      }
    } catch (error) {
      console.error("Failed to resolve prediction:", error);
    } finally {
      if (thisSelection === selectionId.current) setSelectingPlace(false);
    }
  };

  const handleClearSite = () => {
    setPreviewSiteName("");
    setPreviewSite(null);
  };

  const showPredictions = predictions.length > 0 && !selectingPlace;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={nearbyPlaces}
        keyExtractor={(p) => p.placeId}
        renderItem={({ item }) => (
          <NearbyPlaceCard place={item} onPress={() => handleCardPress(item)} />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Text variant="h1" style={styles.heading}>
              Browse Places
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary} style={styles.subheading}>
              Public services near you
            </Text>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <RNText style={styles.searchBrand}>rayo</RNText>
              <View style={styles.searchDivider} />
              <Ionicons name="search" size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={browseSearchQuery}
                onChangeText={setBrowseSearch}
                placeholder="Search for a place..."
                placeholderTextColor={Colors.textSecondary}
                returnKeyType="search"
              />
              {browseSearchQuery.length > 0 && (
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.textSecondary}
                  onPress={() => {
                    setBrowseSearch("");
                    setPredictions([]);
                  }}
                />
              )}
            </View>

            {/* Autocomplete predictions dropdown */}
            {(showPredictions || (predictionsLoading && debouncedQuery.length > 1)) && (
              <View style={styles.predictionsCard}>
                {predictionsLoading && predictions.length === 0 ? (
                  <ActivityIndicator
                    color={Colors.primary}
                    style={styles.predictionsLoader}
                    size="small"
                  />
                ) : (
                  predictions.map((p, i) => (
                    <Pressable
                      key={p.placeId}
                      style={[
                        styles.predictionRow,
                        i < predictions.length - 1 && styles.predictionBorder,
                      ]}
                      onPress={() => handlePredictionPress(p)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <View style={styles.predictionInfo}>
                        <Text variant="bodySm" semiBold numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text
                          variant="caption"
                          color={Colors.textSecondary}
                          numberOfLines={1}
                        >
                          {p.address}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {selectingPlace && (
              <View style={styles.selectingRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text variant="caption" color={Colors.textSecondary}>
                  Finding place...
                </Text>
              </View>
            )}

            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsRow}
            >
              {(BROWSE_FILTERS as unknown as BrowseFilter[]).map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={activeBrowseFilters.includes(item)}
                  onPress={() => toggleBrowseFilter(item)}
                />
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          isFetching ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={32} color={Colors.border} />
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.emptyText}>
                No places found nearby.
              </Text>
            </View>
          )
        }
      />

      {/* Nearby card tap → simple place info sheet */}
      {selectedPlace && (
        <PlaceDetailSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}

      {/* Autocomplete search → DB match or unverified */}
      <BuildingPreviewSheet
        building={previewBuilding}
        onClose={() => setPreviewBuilding(null)}
      />
      <SitePreviewSheet
        site={previewSite}
        placeName={previewSiteName}
        onClose={handleClearSite}
      />
      <UnverifiedPlaceSheet
        place={unverifiedPlace}
        onClose={() => setUnverifiedPlace(null)}
      />
    </SafeAreaView>
  );
}

// ─── Simple sheet for a nearby card tap ────────────────────────────────────

import { useRouter } from "expo-router";
import { SimpleSheet } from "@components/ui/simple-sheet";
import { Button } from "@components/ui/button";
import { useRequireAuth } from "@hooks/use-require-auth";

function PlaceDetailSheet({
  place,
  onClose,
}: {
  place: NearbyPlace;
  onClose: () => void;
}) {
  const router = useRouter();
  const withAuth = useRequireAuth();
  const icon = CATEGORY_ICONS[place.category] ?? "location";

  return (
    <SimpleSheet visible onClose={onClose}>
      <View style={styles.sheetContent}>
        <View style={styles.sheetRow}>
          <View style={styles.sheetIconBox}>
            <Ionicons name={icon} size={24} color={Colors.primary} />
          </View>
          <View style={styles.sheetInfo}>
            <Text variant="h2" numberOfLines={2}>
              {place.name}
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary}>
              {place.address}
            </Text>
          </View>
        </View>

        {place.rating != null && (
          <View style={styles.ratingLarge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text variant="bodySm" color={Colors.textSecondary}>
              {place.rating.toFixed(1)} Google rating
              {place.totalRatings ? ` · ${place.totalRatings} reviews` : ""}
            </Text>
          </View>
        )}

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text variant="caption" color={Colors.textSecondary} style={styles.noticeText}>
            Accessibility data not yet available for this place. Be the first to review it.
          </Text>
        </View>

        <Button
          label="Write the first review"
          onPress={() =>
            withAuth(() => {
              onClose();
              router.push("/review/new");
            })
          }
          fullWidth
        />
      </View>
    </SimpleSheet>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heading: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, marginBottom: 2 },
  subheading: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBrand: {
    fontFamily: FontFamily.heading,
    fontSize: 15,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  searchDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, padding: 0 },

  predictionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    overflow: "hidden",
    ...Shadow.card,
  },
  predictionsLoader: { paddingVertical: Spacing.base },
  predictionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  predictionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  predictionInfo: { flex: 1, gap: 2 },

  selectingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },

  chipsRow: { marginBottom: Spacing.base },
  chips: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  loader: { marginTop: Spacing.xxl },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.xxxl,
  },
  emptyText: { textAlign: "center" },

  // NearbyPlaceCard
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadow.card,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardName: { flex: 1, marginRight: Spacing.sm },
  unknownBadge: {
    backgroundColor: "#9E9E9E20",
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: "#9E9E9E",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },

  // PlaceDetailSheet
  sheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.base,
  },
  sheetRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.base },
  sheetIconBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sheetInfo: { flex: 1, gap: 3 },
  ratingLarge: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
  },
  noticeText: { flex: 1, lineHeight: 18 },
});
