import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BuildingCard } from "@components/buildings/building-card";
import { Chip } from "@components/ui/chip";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, FontSize, Spacing } from "@constants/theme";
import { buildingsService } from "@services/api/buildings.service";
import { BROWSE_FILTERS, useFilterStore } from "@stores/filter.store";
import type { BrowseFilter } from "@stores/filter.store";

export default function Browse() {
  const { browseSearchQuery, setBrowseSearch, activeBrowseFilters, toggleBrowseFilter } =
    useFilterStore();

  // Default: list all buildings (via GeoJSON). When searching: use search endpoint.
  const { data: allBuildings, isFetching: loadingAll } = useQuery({
    queryKey: ["buildings-all"],
    queryFn: () => buildingsService.listAll(),
    enabled: !browseSearchQuery,
    staleTime: 1000 * 60 * 5,
  });

  const { data: searchResults, isFetching: loadingSearch } = useQuery({
    queryKey: ["buildings-search", browseSearchQuery],
    queryFn: () => buildingsService.search(browseSearchQuery),
    enabled: !!browseSearchQuery,
    staleTime: 1000 * 60,
  });

  const buildings = browseSearchQuery ? (searchResults ?? []) : (allBuildings ?? []);
  const isFetching = browseSearchQuery ? loadingSearch : loadingAll;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={buildings}
        keyExtractor={(b) => String(b.id)}
        renderItem={({ item }) => <BuildingCard building={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text variant="h1" style={styles.heading}>Browse Places</Text>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={browseSearchQuery}
                onChangeText={setBrowseSearch}
                placeholder="Search buildings, services..."
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
          ) : browseSearchQuery ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={32} color={Colors.border} />
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.emptyText}>
                No buildings found for "{browseSearchQuery}"
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heading: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, marginBottom: Spacing.base },
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
  chips: { paddingHorizontal: Spacing.xl },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  loader: { marginTop: Spacing.xxl },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.xxxl,
  },
  emptyText: { textAlign: "center" },
});
