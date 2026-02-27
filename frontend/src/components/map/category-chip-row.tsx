import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "@components/ui/chip";
import { Spacing } from "@constants/theme";
import { MAP_CATEGORIES, useFilterStore } from "@stores/filter.store";
import type { MapCategory } from "@stores/filter.store";

export function CategoryChipRow() {
  const { activeMapCategory, setMapCategory } = useFilterStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {MAP_CATEGORIES.map((cat) => (
        <Chip
          key={cat}
          label={cat}
          active={activeMapCategory === cat}
          onPress={() =>
            setMapCategory(activeMapCategory === cat ? null : (cat as MapCategory))
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
});
