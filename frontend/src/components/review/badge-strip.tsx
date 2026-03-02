import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import type { Badge } from "@/types";

interface Props {
  badges: Badge[];
  onSeeAll: () => void;
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICON: Record<string, IoniconName> = {
  community: "star",
  photo: "camera",
  building: "medkit",
};

export function BadgeStrip({ badges, onSeeAll }: Props) {
  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="label" semiBold color={Colors.textSecondary}>YOUR BADGES</Text>
        <Pressable onPress={onSeeAll}>
          <Text variant="label" color={Colors.primary} semiBold>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {earnedBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </ScrollView>
    </View>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const iconName = CATEGORY_ICON[badge.category] ?? "ribbon";

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={24} color={Colors.white} />
      </View>
      <Text variant="caption" semiBold style={styles.name} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text variant="caption" color={Colors.textSecondary} style={styles.sub} numberOfLines={1}>
        {badge.requirement}
      </Text>
      <Text variant="caption" color={Colors.primary} semiBold>
        Earned
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  strip: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  card: {
    width: 100,
    alignItems: "center",
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    ...Shadow.card,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    textAlign: "center",
  },
  sub: {
    textAlign: "center",
  },
});
