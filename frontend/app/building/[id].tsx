import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@components/ui/text";
import { FloorCard } from "@components/buildings/floor-card";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import { buildingsService } from "@services/api/buildings.service";
import { reviewsService, type ReviewRecord } from "@services/api/reviews.service";
import { useRequireAuth } from "@hooks/use-require-auth";

const { width: W } = Dimensions.get("window");

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

function ReviewCard({ review }: { review: ReviewRecord }) {
  const color = LEVEL_COLORS[review.accessibility_level] ?? Colors.textSecondary;
  const label = LEVEL_LABELS[review.accessibility_level] ?? review.accessibility_level;
  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={[styles.levelDot, { backgroundColor: color }]} />
        <Text variant="bodySm" semiBold color={color}>{label}</Text>
        <Text variant="caption" color={Colors.textSecondary} style={styles.reviewDate}>{date}</Text>
      </View>
      <Text variant="caption" color={Colors.textSecondary} style={styles.reviewScope}>
        {review.scope.charAt(0).toUpperCase() + review.scope.slice(1)} review
      </Text>
      {!!review.comment && (
        <Text variant="bodySm" style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );
}

export default function BuildingDetail() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const withAuth = useRequireAuth();

  const { data: building, isLoading, isError } = useQuery({
    queryKey: ["building", id],
    queryFn: () => buildingsService.getById(id!),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsService.getByBuilding(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !building) {
    return (
      <View style={styles.loading}>
        <Text variant="body" color={Colors.textSecondary}>Could not load building details.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={building.floors ?? []}
      keyExtractor={(f) => f.id}
      renderItem={({ item }) => <FloorCard floor={item} />}
      horizontal={false}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* Dark green header */}
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>

            <Text variant="h1" color={Colors.white} style={styles.name}>
              {building.name}
            </Text>
            <Text variant="bodySm" color={Colors.white + "B3"} style={styles.address}>
              {building.address}
            </Text>

            <View style={styles.chips}>
              <View style={styles.chip}>
                <Ionicons name="time-outline" size={12} color={Colors.white} />
                <Text variant="caption" color={Colors.white}>
                  {building.is_open ? "Open now" : "Closed"}
                </Text>
              </View>
              {building.floor_count > 0 && (
                <View style={styles.chip}>
                  <Text variant="caption" color={Colors.white}>{building.floor_count} floors</Text>
                </View>
              )}
              {building.distance_km != null && (
                <View style={styles.chip}>
                  <Text variant="caption" color={Colors.white}>{building.distance_km} km</Text>
                </View>
              )}
            </View>
          </View>

          {/* Floors section header */}
          <View style={styles.floorsSection}>
            <Text variant="label" color={Colors.textSecondary} semiBold style={styles.sectionLabel}>
              FLOORS — SWIPE TO EXPLORE
            </Text>
            <FlatList
              data={building.floors ?? []}
              keyExtractor={(f) => f.id}
              renderItem={({ item }) => <FloorCard floor={item} />}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={W - Spacing.xl}
              decelerationRate="fast"
              contentContainerStyle={styles.floorsList}
              ListEmptyComponent={
                <View style={[styles.emptyFloors, { width: W - Spacing.xl * 2 }]}>
                  <Ionicons name="layers-outline" size={32} color={Colors.border} />
                  <Text variant="bodySm" color={Colors.textSecondary} style={styles.emptyText}>
                    No floor data available yet.
                  </Text>
                </View>
              }
            />
          </View>

          {/* Reviews section header */}
          <View style={styles.reviewsHeader}>
            <Text variant="label" color={Colors.textSecondary} semiBold style={styles.sectionLabel}>
              COMMUNITY REVIEWS ({reviews.length})
            </Text>
            <Pressable
              style={styles.writeBtn}
              onPress={() =>
                withAuth(() =>
                  router.push({
                    pathname: "/review/new",
                    params: { buildingId: id, buildingName: building.name },
                  })
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Write a review"
            >
              <Ionicons name="create-outline" size={14} color={Colors.white} />
              <Text variant="caption" semiBold color={Colors.white}>Write a review</Text>
            </Pressable>
          </View>
        </>
      }
      ListFooterComponent={
        <View style={styles.reviewsList}>
          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Ionicons name="chatbubble-outline" size={28} color={Colors.border} />
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.emptyText}>
                No reviews yet. Be the first!
              </Text>
            </View>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.white + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
    alignSelf: "flex-start",
  },
  name: { marginBottom: Spacing.xs },
  address: { marginBottom: Spacing.base },
  chips: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.white + "40",
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  // Floors
  floorsSection: { paddingTop: Spacing.xl },
  sectionLabel: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
    letterSpacing: 0.8,
  },
  floorsList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  emptyFloors: {
    marginHorizontal: Spacing.base,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  emptyText: { textAlign: "center" },

  // Reviews
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  writeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  reviewsList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.sm,
  },
  emptyReviews: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reviewDate: { marginLeft: "auto" },
  reviewScope: { marginLeft: Spacing.base + 8 },
  reviewComment: { marginTop: Spacing.xs },
});
