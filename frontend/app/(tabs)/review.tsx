import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { StatsRow } from "@components/review/stats-row";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";
import { userService } from "@services/api/user.service";
import { reviewsService, type MyReview } from "@services/api/reviews.service";
import type { Badge } from "@/types";

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  community: "people-outline",
  explorer: "compass-outline",
  impact: "flash-outline",
};

export default function ReviewTab() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => userService.getStats(),
    enabled: !!user,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["user-badges"],
    queryFn: () => userService.getBadges(),
    enabled: !!user,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => reviewsService.getMyReviews(),
    enabled: !!user,
  });

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);
  const nextBadge = lockedBadges[0] ?? null;

  const statsRow = [
    { label: "Reviews", value: stats?.reviewCount ?? 0 },
    { label: "Saves", value: stats?.saveCount ?? 0 },
    { label: "Badges", value: stats?.badgeCount ?? 0 },
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guest}>
          <View style={styles.guestIconBox}>
            <Ionicons name="create-outline" size={32} color={Colors.primary} />
          </View>
          <Text variant="h2" style={styles.guestTitle}>Share your experience</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.guestSub}>
            Sign in to write reviews, earn badges, and help others navigate accessible spaces.
          </Text>
          <Button
            label="Sign in"
            onPress={() => router.push("/(auth)/sign-in")}
            fullWidth
          />
          <Button
            label="Create an account"
            variant="outline"
            onPress={() => router.push("/(auth)/register")}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text variant="h1">My Reviews</Text>
          <Text variant="bodySm" color={Colors.textSecondary} style={styles.sub}>
            Your community impact
          </Text>
        </View>

        <StatsRow stats={statsRow} />

        <Pressable
          style={styles.writeBtn}
          onPress={() => router.push("/review/new")}
          accessibilityRole="button"
          accessibilityLabel="Write a new review"
        >
          <Ionicons name="create-outline" size={18} color={Colors.white} />
          <Text variant="label" semiBold color={Colors.white}>Write a new review</Text>
        </Pressable>
        {myReviews.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" semiBold color={Colors.textSecondary} style={styles.sectionLabel}>
              MY REVIEWS
            </Text>
            {myReviews.map((review) => (
              <MyReviewCard key={review.id} review={review} router={router} />
            ))}
          </View>
        )}
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" semiBold color={Colors.textSecondary} style={styles.sectionLabel}>
              EARNED BADGES
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeScroll}
            >
              {earnedBadges.map((badge) => (
                <EarnedBadgeCard key={badge.id} badge={badge} />
              ))}
            </ScrollView>
          </View>
        )}
        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" semiBold color={Colors.textSecondary} style={styles.sectionLabel}>
              BADGES TO EARN
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeScroll}
            >
              {lockedBadges.map((badge) => (
                <LockedBadgeCard key={badge.id} badge={badge} />
              ))}
            </ScrollView>
          </View>
        )}
        {nextBadge && (
          <View style={styles.section}>
            <Text variant="label" semiBold color={Colors.textSecondary} style={styles.sectionLabel}>
              NEXT BADGE
            </Text>
            <View style={styles.nextCard}>
              <View style={styles.nextIconBox}>
                <Ionicons
                  name={CATEGORY_ICONS[nextBadge.category] ?? "shield-checkmark-outline"}
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.nextInfo}>
                <View style={styles.nextTopRow}>
                  <Text variant="bodySm" semiBold style={styles.nextName}>{nextBadge.name}</Text>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {nextBadge.progress}/{nextBadge.required}
                  </Text>
                </View>
                <Text variant="caption" color={Colors.textSecondary} style={styles.nextDesc}>
                  {nextBadge.description}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((nextBadge.progress / nextBadge.required) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const LEVEL_COLORS: Record<string, string> = {
  fully: Colors.fullyAccessible,
  partial: Colors.partiallyAccessible,
  none: Colors.notAccessible,
};
const LEVEL_LABELS: Record<string, string> = {
  fully: "Fully Accessible",
  partial: "Partially Accessible",
  none: "Not Accessible",
};

function MyReviewCard({ review, router }: { review: MyReview; router: ReturnType<typeof useRouter> }) {
  const color = LEVEL_COLORS[review.accessibility_level] ?? Colors.textSecondary;
  const label = LEVEL_LABELS[review.accessibility_level] ?? review.accessibility_level;
  const placeName = review.building?.building_name ?? review.place_name ?? "Unknown place";
  const siteName = review.building?.site?.name;
  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <Pressable
      style={styles.reviewCard}
      onPress={() => review.building ? router.push(`/building/${review.building.id}`) : undefined}
      accessibilityRole={review.building ? "button" : "text"}
      accessibilityLabel={`Review of ${placeName}`}
    >
      <View style={styles.reviewTop}>
        <View style={styles.reviewMeta}>
          <Text variant="bodySm" semiBold numberOfLines={1}>{placeName}</Text>
          {siteName && (
            <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>{siteName}</Text>
          )}
        </View>
        <View style={[styles.levelPill, { backgroundColor: color + "20", borderColor: color + "60" }]}>
          <Text variant="caption" semiBold color={color}>{label}</Text>
        </View>
      </View>
      <View style={styles.reviewBottom}>
        <Text variant="caption" color={Colors.textSecondary}>
          {review.scope.charAt(0).toUpperCase() + review.scope.slice(1)} · {date}
        </Text>
        {review.building && (
          <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
        )}
      </View>
      {!!review.comment && (
        <Text variant="caption" color={Colors.textSecondary} numberOfLines={2} style={styles.reviewComment}>
          "{review.comment}"
        </Text>
      )}
    </Pressable>
  );
}

function EarnedBadgeCard({ badge }: { badge: Badge }) {
  return (
    <View style={styles.earnedCard}>
      <View style={styles.earnedIconBox}>
        <Ionicons
          name={CATEGORY_ICONS[badge.category] ?? "shield-checkmark-outline"}
          size={20}
          color={Colors.primary}
        />
      </View>
      <View style={styles.badgeInfo}>
        <Text variant="bodySm" semiBold numberOfLines={1}>{badge.name}</Text>
        <Text variant="caption" color={Colors.textSecondary} numberOfLines={2} style={styles.badgeDesc}>
          {badge.description}
        </Text>
      </View>
    </View>
  );
}

function LockedBadgeCard({ badge }: { badge: Badge }) {
  const pct = Math.min((badge.progress / badge.required) * 100, 100);
  return (
    <View style={styles.lockedCard}>
      <View style={styles.lockIconBox}>
        <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.badgeInfo}>
        <Text variant="bodySm" semiBold numberOfLines={1}>{badge.name}</Text>
        <Text variant="caption" color={Colors.textSecondary} numberOfLines={2} style={styles.badgeDesc}>
          {badge.requirement}
        </Text>
        {badge.progress > 0 && (
          <View style={styles.miniTrack}>
            <View style={[styles.miniFill, { width: `${pct}%` }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.huge },
  guest: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  guestIconBox: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  guestTitle: { textAlign: "center" },
  guestSub: { textAlign: "center", marginBottom: Spacing.base },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sub: { marginTop: Spacing.xs },
  writeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    height: 52,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  section: { marginBottom: Spacing.xl },
  sectionLabel: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
    letterSpacing: 0.8,
  },
  badgeScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.base },

  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    ...Shadow.card,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  reviewMeta: { flex: 1 },
  levelPill: {
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    flexShrink: 0,
  },
  reviewBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewComment: { fontStyle: "italic", marginTop: 2 },

  earnedCard: {
    width: 160,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary + "10",
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + "40",
    padding: Spacing.base,
  },
  earnedIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  lockedCard: {
    width: 160,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadow.card,
  },
  lockIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeInfo: { flex: 1, gap: Spacing.xs },
  badgeDesc: { lineHeight: 15 },

  miniTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.pill,
    overflow: "hidden",
    marginTop: 2,
  },
  miniFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
  },

  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.xl,
    ...Shadow.card,
  },
  nextIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary + "40",
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nextInfo: { flex: 1, gap: Spacing.xs },
  nextTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextName: { flex: 1 },
  nextDesc: { lineHeight: 16 },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.pill,
    overflow: "hidden",
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
  },
});
