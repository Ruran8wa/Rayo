import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AllBadgesSheet } from "@components/badges/AllBadgesSheet";
import { BadgeEarnedModal } from "@components/badges/BadgeEarnedModal";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { BadgeStrip } from "@components/review/badge-strip";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";
import { useTextSize } from "@contexts/TextSizeContext";
import { userService } from "@services/api/user.service";
import type { Badge } from "@/types";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const DISABILITY_OPTIONS = [
  { id: "mobility", label: "Mobility Impairment", sub: "Large targets · Ramp & elevator priority", icon: "walk" },
  { id: "visual", label: "Visual Impairment", sub: "High contrast · Screen reader friendly", icon: "eye" },
  { id: "hearing", label: "Hearing Impairment", sub: "Visual alerts · Induction loop info", icon: "ear" },
];

export default function ProfileTab() {
  const { user, signOut, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { largeText, setLargeText } = useTextSize();
  const [selectedNeed, setSelectedNeed] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedModal, setEarnedModal] = useState<Badge | null>(null);
  const notifiedIds = useRef<Set<string> | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    setSelectedNeed(user?.disability_type?.toLowerCase() ?? "");
  }, [user?.disability_type]);

  useEffect(() => {
    if (!user) return;
    userService.getPreferences().then((prefs) => {
      if (prefs?.preferences && typeof prefs.preferences === "object") {
        const backendValue = (prefs.preferences as Record<string, unknown>).large_text;
        if (typeof backendValue === "boolean") {
          setLargeText(backendValue);
        }
      }
    }).catch(() => {});
  }, [user?.disability_type]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      userService.getBadges().then((fresh) => {

        if (notifiedIds.current === null) {
          notifiedIds.current = new Set(fresh.filter((b) => b.earned).map((b) => b.id));
          setBadges(fresh);
          return;
        }

        const newBadge = fresh.find((b) => b.earned && !notifiedIds.current!.has(b.id));
        setBadges(fresh);
        if (newBadge) {
          notifiedIds.current.add(newBadge.id);
          setEarnedModal(newBadge);
        }
      }).catch(() => {});
    }, [user])
  );

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(scrollY.value, [0, 80], [Spacing.xxl, Spacing.base], "clamp"),
  }));

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user?.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const { name } = await userService.updateProfile(trimmed);
      if (user) await updateUser({ ...user, name });
      setEditingName(false);
    } catch {
      Alert.alert("Error", "Could not update name. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

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
          <View style={styles.guestIconBox}>
            <Ionicons name="person-outline" size={32} color={Colors.primary} />
          </View>
          <Text variant="h2" style={styles.guestTitle}>You're browsing as a guest</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.guestSub}>
            Create an account to save places, write reviews, and personalize your experience.
          </Text>
          <Button
            label="Sign in"
            onPress={() => router.push("/(auth)/sign-in")}
            fullWidth
          />
          <Button
            label="Create an account"
            variant="outline"
            onPress={() => router.push("/eula?context=signup")}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);

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
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                placeholderTextColor={Colors.white + "80"}
                selectionColor={Colors.white}
              />
              <Pressable onPress={handleSaveName} disabled={savingName} style={styles.nameSaveBtn}>
                <Ionicons name="checkmark" size={20} color={Colors.white} />
              </Pressable>
              <Pressable onPress={() => setEditingName(false)} style={styles.nameSaveBtn}>
                <Ionicons name="close" size={20} color={Colors.white + "80"} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => { setNameInput(user.name); setEditingName(true); }}
              accessibilityRole="button"
              accessibilityLabel="Edit name"
            >
              <Text variant="h2" color={Colors.white}>{user.name}</Text>
              <Ionicons name="pencil-outline" size={16} color={Colors.white + "99"} style={styles.editIcon} />
            </Pressable>
          )}
          <Text variant="bodySm" color={Colors.white + "CC"}>{user.email}</Text>
          {earnedBadges.length > 0 && (
            <View style={styles.badges}>
              {earnedBadges.map((b) => (
                <View key={b.id} style={styles.badgeChip}>
                  <Ionicons name="star" size={12} color={Colors.white} />
                  <Text variant="caption" color={Colors.white}>{b.name}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Accessibility needs */}
        <Section title="MY ACCESSIBILITY NEEDS">
          <Pressable
            style={[styles.dropdownTrigger, dropdownOpen && styles.dropdownTriggerOpen]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setDropdownOpen((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel="Select accessibility need"
          >
            {(() => {
              const active = DISABILITY_OPTIONS.find((o) => o.id === selectedNeed);
              return active ? (
                <View style={styles.dropdownSelected}>
                  <Ionicons name={active.icon as any} size={18} color={Colors.primary} />
                  <Text variant="bodySm" semiBold color={Colors.textPrimary} style={styles.dropdownLabel}>
                    {active.label}
                  </Text>
                </View>
              ) : (
                <Text variant="bodySm" color={Colors.textSecondary} style={styles.dropdownLabel}>
                  Select your accessibility need…
                </Text>
              );
            })()}
            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {DISABILITY_OPTIONS.map((opt, i) => {
                const isSelected = selectedNeed === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      i < DISABILITY_OPTIONS.length - 1 && styles.dropdownItemBorder,
                    ]}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setSelectedNeed(opt.id);
                      setDropdownOpen(false);
                      userService.setPreferences(opt.id, {}).catch(() => {});
                      if (user) updateUser({ ...user, disability_type: opt.id });
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={opt.label}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                    <View style={styles.needInfo}>
                      <Text variant="bodySm" semiBold color={isSelected ? Colors.primary : Colors.textPrimary}>
                        {opt.label}
                      </Text>
                      <Text variant="caption" color={Colors.textSecondary}>{opt.sub}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Section>

        {badges.length > 0 && (
          <View style={styles.badgeStripWrapper}>
            <BadgeStrip badges={badges} onSeeAll={() => setShowAllBadges(true)} />
          </View>
        )}

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
            onPress={() => router.push("/eula?context=profile")}
            accessibilityRole="button"
            accessibilityLabel="Terms and Privacy Policy"
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />
            <Text variant="body" color={Colors.textPrimary} style={styles.prefLabel}>Terms & Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>
          <View style={styles.accountDivider} />
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

      <BadgeEarnedModal badge={earnedModal} onDismiss={() => setEarnedModal(null)} />
      <AllBadgesSheet
        badges={badges}
        visible={showAllBadges}
        onClose={() => setShowAllBadges(false)}
      />
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  editIcon: { marginTop: 2 },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  nameInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white + "60",
    paddingVertical: 2,
  },
  nameSaveBtn: {
    padding: Spacing.xs,
  },
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
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  dropdownTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: "transparent",
  },
  dropdownSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  dropdownLabel: { flex: 1 },
  dropdownList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  dropdownItemActive: { backgroundColor: Colors.primary + "08" },
  dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  needInfo: { flex: 1 },
  badgeStripWrapper: { marginTop: Spacing.xl },
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
  accountDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Spacing.base,
  },
  guestContainer: {
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
  guestSub: { textAlign: "center", marginBottom: Spacing.base, lineHeight: 24 },
});

const sectionStyles = StyleSheet.create({
  container: { marginTop: Spacing.xl, marginHorizontal: Spacing.xl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
