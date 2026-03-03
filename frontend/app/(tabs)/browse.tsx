import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SimpleSheet } from "@components/ui/simple-sheet";
import { Button } from "@components/ui/button";
import { Chip } from "@components/ui/chip";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from "@constants/theme";
import { placesService, type NearbyPlace } from "@services/api/places.service";
import { BROWSE_FILTERS, useFilterStore } from "@stores/filter.store";
import type { BrowseFilter } from "@stores/filter.store";

const KIGALI_DEFAULT = { lat: -1.9441, lng: 30.0619 };

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  Health:     "medical",
  Government: "business",
  Bank:       "card",
  Education:  "school",
  Other:      "location",
};

// ─── Place card shown in the list ─────────────────────────────────────────

function NearbyPlaceCard({ place, onPress }: { place: NearbyPlace; onPress: () => void }) {
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
            <Text variant="caption" color={Colors.textSecondary} semiBold>Unknown</Text>
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

// ─── Detail sheet for a selected nearby place ──────────────────────────────

function PlaceDetailSheet({
  place,
  onClose,
}: {
  place: NearbyPlace | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const icon = place ? (CATEGORY_ICONS[place.category] ?? "location") : "location";

  return (
    <SimpleSheet visible={place != null} onClose={onClose}>
      {place && (
        <View style={styles.sheetContent}>
          <View style={styles.sheetRow}>
            <View style={styles.sheetIconBox}>
              <Ionicons name={icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.sheetInfo}>
              <Text variant="h2" numberOfLines={2}>{place.name}</Text>
              <Text variant="bodySm" color={Colors.textSecondary}>{place.address}</Text>
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
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary} style={styles.noticeText}>
              Accessibility data not yet available for this place. Be the first to review it.
            </Text>
          </View>

          <Button
            label="Write the first review"
            onPress={() => {
              onClose();
              router.push("/review/new");
            }}
            fullWidth
          />
        </View>
      )}
    </SimpleSheet>
  );
}

// ─── Main Browse screen ────────────────────────────────────────────────────

export default function Browse() {
  const { browseSearchQuery, setBrowseSearch, activeBrowseFilters, toggleBrowseFilter } =
    useFilterStore();

  const [location, setLocation] = useState(KIGALI_DEFAULT);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // Get user location once on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
  }, []);

  // Determine active category filter (first non-"Near me" active filter)
  const categoryFilter = activeBrowseFilters.find(
    (f) => f !== "Near me" && ["Health", "Government", "Bank", "Education"].includes(f)
  );

  const { data: nearbyPlaces, isFetching } = useQuery({
    queryKey: ["nearby", location.lat, location.lng, categoryFilter ?? "all"],
    queryFn: () => placesService.nearbySearch(location.lat, location.lng, categoryFilter),
    staleTime: 1000 * 60 * 5,
  });

  // Client-side search filter
  const filtered = browseSearchQuery
    ? (nearbyPlaces ?? []).filter(
        (p) =>
          p.name.toLowerCase().includes(browseSearchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(browseSearchQuery.toLowerCase())
      )
    : (nearbyPlaces ?? []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.placeId}
        renderItem={({ item }) => (
          <NearbyPlaceCard place={item} onPress={() => setSelectedPlace(item)} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text variant="h1" style={styles.heading}>Browse Places</Text>
            <Text variant="bodySm" color={Colors.textSecondary} style={styles.subheading}>
              Public services near you
            </Text>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={browseSearchQuery}
                onChangeText={setBrowseSearch}
                placeholder="Search nearby places..."
                placeholderTextColor={Colors.textSecondary}
                returnKeyType="search"
              />
              {browseSearchQuery.length > 0 && (
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.textSecondary}
                  onPress={() => setBrowseSearch("")}
                />
              )}
            </View>

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

      <PlaceDetailSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </SafeAreaView>
  );
}

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
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, padding: 0 },
  chipsRow: { marginBottom: Spacing.base },
  chips: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  loader: { marginTop: Spacing.xxl },
  empty: { alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingTop: Spacing.xxxl },
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
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
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
  sheetContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing.lg, gap: Spacing.base },
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
