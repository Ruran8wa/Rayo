import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
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
  {
    id: "1",
    name: "Helpful Hero",
    description: "Receive 25 helpful votes on your reviews",
    category: "community" as const,
    requirement: "25+ helpful votes",
    earned: true,
  },
  {
    id: "2",
    name: "Photo Pro",
    description: "Upload 20 or more accessibility photos",
    category: "photo" as const,
    requirement: "20+ photos",
    earned: true,
  },
  {
    id: "3",
    name: "Health Expert",
    description: "Review 5 or more hospitals or clinics",
    category: "building" as const,
    requirement: "5+ hospitals",
    earned: true,
  },
  {
    id: "4",
    name: "Civic Guide",
    description: "Review 5 government buildings",
    category: "building" as const,
    requirement: "Review 5 gov buildings",
    progress: 2,
    required: 5,
    earned: false,
  },
];

export default function ReviewTab() {
  const router = useRouter();
  const { user } = useAuth();

  const nextBadge = MOCK_BADGES.find((b) => !b.earned);

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

        <StatsRow stats={MOCK_STATS} />

        <Pressable
          style={styles.writeBtn}
          onPress={() => router.push("/review/new")}
          accessibilityRole="button"
          accessibilityLabel="Write a new review"
        >
          <Ionicons name="create-outline" size={18} color={Colors.white} />
          <Text style={styles.writeBtnLabel}>Write a new review</Text>
        </Pressable>

        <BadgeStrip badges={MOCK_BADGES} onSeeAll={() => {}} />

        {nextBadge && (
          <View style={styles.nextSection}>
            <Text variant="label" semiBold color={Colors.textSecondary} style={styles.nextLabel}>
              NEXT BADGE
            </Text>
            <View style={styles.nextCard}>
              <View style={styles.nextIconBox}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.nextInfo}>
                <View style={styles.nextTopRow}>
                  <Text variant="bodySm" semiBold style={styles.nextName}>{nextBadge.name}</Text>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {nextBadge.progress ?? 0}/{nextBadge.required ?? 0}
                  </Text>
                </View>
                <Text variant="caption" color={Colors.textSecondary} style={styles.nextDesc}>
                  {nextBadge.description}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.round(
                          ((nextBadge.progress ?? 0) / (nextBadge.required ?? 1)) * 100
                        )}%`,
                      },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Spacing.huge,
  },
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
  guestTitle: {
    textAlign: "center",
  },
  guestSub: {
    textAlign: "center",
    marginBottom: Spacing.base,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sub: {
    marginTop: Spacing.xs,
  },
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
  writeBtnLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  nextSection: {
    paddingHorizontal: Spacing.xl,
  },
  nextLabel: {
    marginBottom: Spacing.sm,
  },
  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadow.card,
  },
  nextIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nextInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nextTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextName: {
    flex: 1,
  },
  nextDesc: {
    lineHeight: 16,
  },
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
