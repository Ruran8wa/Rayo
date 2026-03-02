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
import { Ionicons } from "@expo/vector-icons";

export default function Browse() {
  const { browseSearchQuery, setBrowseSearch, activeBrowseFilters, toggleBrowseFilter } =
    useFilterStore();

  const { data: buildings, isFetching } = useQuery({
    queryKey: ["buildings-search", browseSearchQuery],
    queryFn: () => buildingsService.search(browseSearchQuery),
    staleTime: 1000 * 60,
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={buildings ?? []}
        keyExtractor={(b) => String(b.id)}
        renderItem={({ item }) => <BuildingCard building={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text variant="h1" style={styles.heading}>Browse Places</Text>
            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={browseSearchQuery}
                onChangeText={setBrowseSearch}
                placeholder="Search buildings, services..."
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            {/* Filters */}
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
});
