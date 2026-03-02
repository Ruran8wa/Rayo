import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from "@constants/theme";
import type { AccessibilityLevel } from "@/types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Scope = "building" | "floor" | "service";

const SCOPES: { value: Scope; label: string; sub: string }[] = [
  { value: "building", label: "Whole building", sub: "Overall impression" },
  { value: "floor", label: "Specific floor", sub: "Rate one floor" },
  { value: "service", label: "Specific service", sub: "Rate one service" },
];

const LEVELS: { value: AccessibilityLevel; label: string; color: string }[] = [
  { value: "fully", label: "Fully\nAccessible", color: Colors.fullyAccessible },
  { value: "partial", label: "Partially\nAccessible", color: Colors.partiallyAccessible },
  { value: "none", label: "Not\nAccessible", color: Colors.notAccessible },
];

export default function WriteReview() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("building");
  const [level, setLevel] = useState<AccessibilityLevel | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!level) return;
    setSubmitting(true);
    // TODO: call review API when endpoint is available
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
            <Text variant="label" color={Colors.textSecondary}>← Back</Text>
          </Pressable>

          <Text variant="h1" style={styles.heading}>Write a Review</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.sub}>
            Help others know what to expect
          </Text>

          {/* Scope */}
          <Text
            variant="label"
            semiBold
            color={Colors.textSecondary}
            style={styles.sectionLabel}
          >
            WHAT ARE YOU REVIEWING?
          </Text>
          {SCOPES.map((s) => (
            <ScopeOption
              key={s.value}
              item={s}
              selected={scope === s.value}
              onSelect={() => setScope(s.value)}
            />
          ))}

          {/* Accessibility level */}
          <Text
            variant="label"
            semiBold
            color={Colors.textSecondary}
            style={styles.sectionLabel}
          >
            ACCESSIBILITY CLASS
          </Text>
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <LevelCard
                key={l.value}
                item={l}
                selected={level === l.value}
                onSelect={() => setLevel(l.value)}
              />
            ))}
          </View>

          {/* Comment */}
          <Text
            variant="label"
            semiBold
            color={Colors.textSecondary}
            style={styles.sectionLabel}
          >
            YOUR COMMENT
          </Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="The ramp at the entrance works great, but the restrooms on this floor..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Button
            label="Submit Review"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!level}
            fullWidth
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ScopeOption({
  item,
  selected,
  onSelect,
}: {
  item: (typeof SCOPES)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[styles.scopeOption, selected && styles.scopeSelected, animStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityLabel={`${item.label}: ${item.sub}`}
      accessibilityState={{ checked: selected }}
    >
      <View style={styles.scopeInfo}>
        <Text variant="bodySm" bold>{item.label}</Text>
        <Text variant="caption" color={Colors.textSecondary}>{item.sub}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]} />
    </AnimatedPressable>
  );
}

function LevelCard({
  item,
  selected,
  onSelect,
}: {
  item: (typeof LEVELS)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[
        styles.levelCard,
        { borderColor: selected ? item.color : Colors.border },
        selected && { backgroundColor: item.color + "15" },
        animStyle,
      ]}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${item.label.replace('\n', ' ')}`}
      accessibilityState={{ selected: selected }}
    >
      <Text variant="label" color={item.color} semiBold style={styles.levelLabel}>
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  back: { marginBottom: Spacing.xxl },
  heading: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xl },
  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  scopeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  scopeSelected: { borderColor: Colors.primary },
  scopeInfo: { flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  levelRow: { flexDirection: "row", gap: Spacing.sm },
  levelCard: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    ...Shadow.card,
    backgroundColor: Colors.surface,
  },
  levelLabel: { textAlign: "center", lineHeight: 18 },
  commentInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    minHeight: 120,
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  submitBtn: { marginTop: Spacing.xl },
});
