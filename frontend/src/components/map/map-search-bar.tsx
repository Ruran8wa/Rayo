import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from "@constants/theme";
import { useFilterStore } from "@stores/filter.store";

export function MapSearchBar() {
  const { mapSearchQuery, setMapSearch } = useFilterStore();

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={mapSearchQuery}
        onChangeText={setMapSearch}
        placeholder="Search places..."
        placeholderTextColor={Colors.textSecondary}
      />
      {mapSearchQuery.length > 0 && (
        <Pressable onPress={() => setMapSearch("")}>
          <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    padding: 0,
  },
});
