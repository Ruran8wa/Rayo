import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { StatsRow } from "@components/review/stats-row";
import { BadgeStrip } from "@components/review/badge-strip";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";

const MOCK_STATS = [
  { label: "Reviews", value: 12 },
  { label: "Helpful votes", value: 47 },
  { label: "Photos", value: 23 },
  { label: "Badges", value: 3 },
];

const MOCK_BADGES = [
  { id: "1", name: "Helpful Hero", description: "", category: "community" as const, requirement: "", earned: true },
  { id: "2", name: "Photo Pro", description: "", category: "photo" as const, requirement: "", earned: true },
  { id: "3", name: "Health Expert", description: "", category: "building" as const, requirement: "", earned: true },
  { id: "4", name: "Civic Guide", description: "", category: "building" as const, requirement: "Review 3 more government buildings", progress: 2, required: 5, earned: false },
];

export default function ReviewTab() {
  const router = useRouter();
  const { user } = useAuth();

  const handleWriteReview = () => {
    if (!user) {
      router.push("/(auth)/sign-in");
      return;
    }
    router.push("/review/new");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="h1" style={styles.heading}>My Reviews</Text>
        <Text variant="bodySm" color={Colors.textSecondary} style={styles.sub}>Your community impact</Text>

        <StatsRow stats={MOCK_STATS} />

        <Button
          label="Write a new review"
          onPress={handleWriteReview}
          fullWidth
          style={styles.writeBtn}
        />

        <BadgeStrip badges={MOCK_BADGES} onSeeAll={() => {}} />

        {/* Next badge progress */}
        <View style={styles.nextBadge}>
          <Text variant="label" semiBold color={Colors.textSecondary}>NEXT BADGE</Text>
          <View style={styles.nextBadgeCard}>
            <Text variant="bodySm" bold>Civic Guide</Text>
            <Text variant="caption" color={Colors.textSecondary}>
              Review 3 more government buildings
            </Text>
            <View style={styles.progress}>
              <View style={[styles.progressFill, { width: "40%" }]} />
            </View>
            <Text variant="caption" color={Colors.textSecondary}>2/5</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.huge },
  heading: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sub: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base },
  writeBtn: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  nextBadge: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  nextBadgeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  progress: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
  },
});
