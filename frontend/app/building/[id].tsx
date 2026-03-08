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
import { useAuth } from "@contexts/AuthContext";

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

const FEATURE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "Step-free entrance": "git-merge-outline",
  "Elevator": "arrow-up-outline",
  "Handrails": "hand-left-outline",
  "Ramp": "trending-up-outline",
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
  const params = useLocalSearchParams<{ id: string | string[]; siteId?: string; siteName?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const siteId = Array.isArray(params.siteId) ? params.siteId[0] : params.siteId;
  const siteName = Array.isArray(params.siteName) ? params.siteName[0] : params.siteName;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const withAuth = useRequireAuth();
  const { user } = useAuth();

  const { data: building, isLoading, isError } = useQuery({
    queryKey: ["building", id],
    queryFn: () => buildingsService.getById(id!),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsService.getByBuilding(id!),
    enabled: !!id,
    staleTime: 0,
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
      data={[]}
      keyExtractor={() => ""}
      renderItem={null}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <Pressable
              onPress={() => siteId
                ? router.replace({ pathname: "/site/[id]", params: { id: siteId, name: siteName } })
                : router.back()
              }
              style={styles.backBtn}
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <View style={styles.nameRow}>
              <Text variant="h1" color={Colors.white} style={styles.name}>
                {building.name}
              </Text>
              {building.accessibility_level !== "unknown" && (
                <View style={[
                  styles.accessBadge,
                  { backgroundColor: LEVEL_COLORS[building.accessibility_level] + "30",
                    borderColor: LEVEL_COLORS[building.accessibility_level] + "80" },
                ]}>
                  <Ionicons
                    name={building.accessibility_level === "fully" ? "checkmark-circle" : building.accessibility_level === "partial" ? "remove-circle" : "close-circle"}
                    size={11}
                    color={building.accessibility_level === "fully" ? "#4ADE80" : LEVEL_COLORS[building.accessibility_level]}
                  />
                  <Text
                    variant="caption"
                    semiBold
                    color={building.accessibility_level === "fully" ? "#4ADE80" : LEVEL_COLORS[building.accessibility_level]}
                  >
                    {LEVEL_LABELS[building.accessibility_level]}
                  </Text>
                </View>
              )}
            </View>

            {building.site_name && (
              <View style={styles.siteRow}>
                <Ionicons name="business-outline" size={12} color={Colors.white + "BB"} />
                <Text variant="caption" color={Colors.white + "BB"}>{building.site_name}</Text>
              </View>
            )}
            {!!building.address && (
              <Text variant="caption" color={Colors.white + "80"} style={styles.address}>
                {building.address}
              </Text>
            )}

            <View style={styles.chips}>
              {building.floor_count > 0 && (
                <View style={styles.chip}>
                  <Ionicons name="layers-outline" size={12} color={Colors.white} />
                  <Text variant="caption" color={Colors.white}>{building.floor_count} floor{building.floor_count !== 1 ? "s" : ""}</Text>
                </View>
              )}
              {building.distance_km != null && (
                <View style={styles.chip}>
                  <Ionicons name="navigate-outline" size={12} color={Colors.white} />
                  <Text variant="caption" color={Colors.white}>{building.distance_km} km away</Text>
                </View>
              )}
              {building.category ? (
                <View style={styles.chip}>
                  <Text variant="caption" color={Colors.white}>{building.category}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <DisabilityBar building={building} userDisability={user?.disability_type} />
          {(building.features ?? []).length > 0 && (
            <View style={styles.featuresSection}>
              <Text variant="label" color={Colors.textSecondary} semiBold style={styles.sectionLabel}>
                FEATURES
              </Text>
              <View style={styles.featuresRow}>
                {building.features.map((feat) => (
                  <View key={feat} style={styles.featureChip}>
                    <Ionicons
                      name={FEATURE_ICONS[feat] ?? "checkmark-circle-outline"}
                      size={13}
                      color={Colors.fullyAccessible}
                    />
                    <Text variant="caption" semiBold color={Colors.fullyAccessible}>{feat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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

const DISABILITY_EMPHASIS: Record<string, "mobility" | "visual" | "hearing"> = {
  mobility: "mobility",
  "mobility impairment": "mobility",
  visual: "visual",
  "visual impairment": "visual",
  hearing: "hearing",
  "hearing impairment": "hearing",
};

function DisabilityBar({
  building,
  userDisability,
}: {
  building: ReturnType<typeof buildingsService.getById> extends Promise<infer T> ? T : never;
  userDisability?: string;
}) {
  const userNeed = userDisability
    ? DISABILITY_EMPHASIS[userDisability.toLowerCase()] ?? null
    : null;

  const features = building.features ?? [];
  const hasMobility =
    features.some((f) =>
      ["step-free entrance", "ramp", "elevator", "handrails"].some((kw) =>
        f.toLowerCase().includes(kw)
      )
    );

  const floors = building.floors ?? [];
  const hasVisual = floors.some((f) => f.high_contrast_signage || f.clear_signage);
  const hasHearing = floors.some((f) => f.clear_signage);

  const items: { key: "mobility" | "visual" | "hearing"; label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; ok: boolean }[] = [
    { key: "mobility", label: "Mobility", icon: "walk-outline", ok: hasMobility },
    { key: "visual",   label: "Visual",   icon: "eye-outline",  ok: hasVisual },
    { key: "hearing",  label: "Hearing",  icon: "ear-outline",  ok: hasHearing },
  ];

  return (
    <View style={dbStyles.bar}>
      {items.map((item) => {
        const isMe = item.key === userNeed;
        const color = item.ok ? Colors.fullyAccessible : Colors.notAccessible;
        return (
          <View
            key={item.key}
            style={[
              dbStyles.item,
              { backgroundColor: color + (isMe ? "18" : "0D"), borderColor: color + (isMe ? "BB" : "40") },
              isMe && dbStyles.itemMe,
            ]}
          >
            <Ionicons name={item.icon} size={13} color={color} />
            <Text variant="caption" semiBold={isMe} color={color} style={dbStyles.itemLabel}>
              {item.label}
            </Text>
            <Ionicons
              name={item.ok ? "checkmark-circle" : "close-circle"}
              size={13}
              color={color}
              style={dbStyles.statusIcon}
            />
            {isMe && (
              <View style={dbStyles.youTag}>
                <Text style={dbStyles.youText}>You</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const dbStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.background,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 80,
  },
  itemMe: { borderWidth: 1.5 },
  itemLabel: { flex: 1 },
  statusIcon: { marginLeft: "auto" },
  youTag: {
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: Colors.primary + "20",
  },
  youText: { fontSize: 9, color: Colors.primary, fontWeight: "700" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
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
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  name: { flex: 1 },
  accessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  siteRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  address: { marginBottom: Spacing.base },
  chips: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap", marginTop: Spacing.base },
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

  featuresSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.fullyAccessible + "10",
    borderWidth: 1,
    borderColor: Colors.fullyAccessible + "40",
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  floorsSection: { paddingTop: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
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

  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
