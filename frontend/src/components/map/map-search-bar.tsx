import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from "@constants/theme";
import { useFilterStore } from "@stores/filter.store";

export function MapSearchBar() {
  const { mapSearchQuery, setMapSearch } = useFilterStore();

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>rayo</Text>
      <View style={styles.divider} />

      <Ionicons name="search" size={16} color={Colors.textSecondary} />
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
  brand: {
    fontFamily: FontFamily.heading,
    fontSize: 15,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    padding: 0,
  },
});
