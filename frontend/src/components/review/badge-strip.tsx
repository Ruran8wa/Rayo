import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import type { Badge } from "@/types";

interface Props {
  badges: Badge[];
  onSeeAll: () => void;
}

export function BadgeStrip({ badges, onSeeAll }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text variant="label" semiBold color={Colors.textSecondary}>YOUR BADGES</Text>
        <Pressable onPress={onSeeAll}>
          <Text variant="label" color={Colors.primary} semiBold>See all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {badges.map((b) => (
          <View key={b.id} style={[styles.badge, !b.earned && styles.locked]}>
            <Ionicons name="star" size={22} color={b.earned ? Colors.primary : Colors.border} />
            <Text variant="caption" color={b.earned ? Colors.textPrimary : Colors.textSecondary} style={styles.badgeName}>
              {b.name}
            </Text>
            <Text variant="caption" color={b.earned ? Colors.primary : Colors.textSecondary}>
              {b.earned ? "Earned" : "Locked"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: Spacing.xl, marginBottom: Spacing.base },
  strip: { paddingHorizontal: Spacing.xl, gap: Spacing.base },
  badge: {
    width: 88,
    alignItems: "center",
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    ...Shadow.card,
  },
  locked: { opacity: 0.5 },
  badgeName: { textAlign: "center", marginTop: 2 },
});
