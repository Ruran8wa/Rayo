import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { StatsRow } from "@components/review/stats-row";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";

const EMPTY_STATS = [
  { label: "Reviews", value: 0 },
  { label: "Helpful votes", value: 0 },
  { label: "Photos", value: 0 },
  { label: "Badges", value: 0 },
];

const AVAILABLE_BADGES = [
  {
    id: "community-starter",
    name: "Community Starter",
    description: "Write your first accessibility review",
  },
  {
    id: "civic-guide",
    name: "Civic Guide",
    description: "Review 5 government buildings",
  },
  {
    id: "health-expert",
    name: "Health Expert",
    description: "Review 5 hospitals or clinics",
  },
];

const FIRST_REVIEW_BADGE = {
  ...AVAILABLE_BADGES[0],
  progress: 0,
  required: 1,
};

export default function ReviewTab() {
  const router = useRouter();
  const { user } = useAuth();

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

        <StatsRow stats={EMPTY_STATS} />

        <Pressable
          style={styles.writeBtn}
          onPress={() => router.push("/review/new")}
          accessibilityRole="button"
          accessibilityLabel="Write a new review"
        >
          <Ionicons name="create-outline" size={18} color={Colors.white} />
          <Text variant="label" semiBold color={Colors.white}>Write a new review</Text>
        </Pressable>

        {/* Badges to earn */}
        <View style={styles.badgesSection}>
          <Text variant="label" semiBold color={Colors.textSecondary} style={styles.sectionLabel}>
            BADGES TO EARN
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeScroll}
          >
            {AVAILABLE_BADGES.map((badge) => (
              <View key={badge.id} style={styles.lockedCard}>
                <View style={styles.lockIconBox}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                </View>
                <View style={styles.lockedInfo}>
                  <Text variant="bodySm" semiBold numberOfLines={1}>{badge.name}</Text>
                  <Text variant="caption" color={Colors.textSecondary} style={styles.lockedDesc} numberOfLines={2}>
                    {badge.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Next badge spotlight */}
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
                <Text variant="bodySm" semiBold style={styles.nextName}>
                  {FIRST_REVIEW_BADGE.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {FIRST_REVIEW_BADGE.progress}/{FIRST_REVIEW_BADGE.required}
                </Text>
              </View>
              <Text variant="caption" color={Colors.textSecondary} style={styles.nextDesc}>
                {FIRST_REVIEW_BADGE.description}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: "0%" }]} />
              </View>
            </View>
          </View>
        </View>

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
  badgesSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
    letterSpacing: 0.8,
  },
  badgeScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
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
  lockedInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  lockedDesc: {
    lineHeight: 15,
  },
  nextSection: {
    paddingHorizontal: Spacing.xl,
  },
  nextLabel: {
    marginBottom: Spacing.sm,
    letterSpacing: 0.8,
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
