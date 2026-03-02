import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const DISABILITY_OPTIONS = [
  { id: "mobility", label: "Mobility Impairment", sub: "Large targets · Ramp & elevator priority", icon: "walk" },
  { id: "visual", label: "Visual Impairment", sub: "High contrast · Screen reader friendly", icon: "eye" },
  { id: "hearing", label: "Hearing Impairment", sub: "Visual alerts · Induction loop info", icon: "ear" },
];

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // TODO: persist largeText preference via userService.updateProfile when endpoint is available
  const [largeText, setLargeText] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.disability_type) {
      setSelectedNeeds([user.disability_type.toLowerCase()]);
    }
  }, [user?.disability_type]);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(scrollY.value, [0, 80], [Spacing.xxl, Spacing.base], "clamp"),
  }));

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={64} color={Colors.border} />
          <Text variant="h2" style={styles.guestTitle}>You're browsing as a guest</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.guestSub}>
            Create an account to save places, write reviews, and personalize your experience.
          </Text>
          <Pressable
            style={styles.signInBtn}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text variant="label" color={Colors.white} semiBold>Create an account</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(auth)/sign-in")}>
            <Text variant="label" color={Colors.primary} semiBold>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const initials =
    (user.name ?? "")
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <View style={styles.container}>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.huge + insets.bottom }]}
      >
        {/* Header card */}
        <Animated.View style={[styles.header, headerStyle, { paddingTop: insets.top + Spacing.xl }]}>
          <View style={styles.avatar}>
            <Text variant="h2" color={Colors.primary}>{initials}</Text>
          </View>
          <Text variant="h2" color={Colors.white} style={styles.name}>{user.name}</Text>
          <Text variant="bodySm" color={Colors.white + "CC"}>{user.email}</Text>
          <View style={styles.badges}>
            {["Helpful Hero", "Photo Pro", "Health Expert"].map((b) => (
              <View key={b} style={styles.badgeChip}>
                <Ionicons name="star" size={12} color={Colors.white} />
                <Text variant="caption" color={Colors.white}>{b}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Accessibility needs */}
        <Section
          title="MY ACCESSIBILITY NEEDS"
          actionLabel="Edit"
          onAction={() =>
            Alert.alert("Accessibility Needs", "Tap each option below to toggle your needs.")
          }
        >
          {DISABILITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.needRow, selectedNeeds.includes(opt.id) && styles.needRowActive]}
              onPress={() =>
                setSelectedNeeds((prev) =>
                  prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                )
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedNeeds.includes(opt.id) }}
              accessibilityLabel={opt.label}
            >
              <Ionicons
                name={opt.icon as any}
                size={20}
                color={selectedNeeds.includes(opt.id) ? Colors.primary : Colors.textSecondary}
              />
              <View style={styles.needInfo}>
                <Text variant="bodySm" bold>{opt.label}</Text>
                <Text variant="caption" color={Colors.textSecondary}>{opt.sub}</Text>
              </View>
              {selectedNeeds.includes(opt.id) && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </Section>

        {/* UI preferences */}
        <Section title="UI PREFERENCES">
          <View style={styles.prefRow}>
            <Ionicons name="text" size={20} color={Colors.textSecondary} />
            <Text variant="body" style={styles.prefLabel}>Large text</Text>
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </Section>

        {/* Account */}
        <Section title="ACCOUNT">
          <Pressable
            style={styles.accountRow}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.notAccessible} />
            <Text variant="body" color={Colors.notAccessible} style={styles.prefLabel}>Sign out</Text>
          </Pressable>
        </Section>
      </AnimatedScrollView>
    </View>
  );
}

function Section({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <Text variant="label" semiBold color={Colors.textSecondary} style={sectionStyles.title}>
          {title}
        </Text>
        {actionLabel && (
          <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel}>
            <Text variant="label" color={Colors.primary} semiBold>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      <View style={sectionStyles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.huge },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
  },
  name: { marginBottom: Spacing.xs },
  badges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.base,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.white + "40",
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  needRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  needRowActive: { backgroundColor: Colors.primary + "10" },
  needInfo: { flex: 1 },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  prefLabel: { flex: 1 },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxl,
  },
  guestTitle: { marginTop: Spacing.base, marginBottom: Spacing.sm },
  guestSub: { textAlign: "center", marginBottom: Spacing.xl, lineHeight: 24 },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.base,
  },
});

const sectionStyles = StyleSheet.create({
  container: { marginTop: Spacing.base, marginHorizontal: Spacing.base },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: { letterSpacing: 0.8 },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadow.card,
  },
});
