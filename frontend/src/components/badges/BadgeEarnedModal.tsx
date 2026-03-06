import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Badge } from "@/types";

const CATEGORY_ICON: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  community: "star",
  explorer: "compass",
  impact: "ribbon",
};

interface Props {
  badge: Badge | null;
  onDismiss: () => void;
}

export function BadgeEarnedModal({ badge, onDismiss }: Props) {
  const scale = useSharedValue(0);
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (badge) {
      scale.value = 0;
      ringScale.value = 0.6;
      ringOpacity.value = 0;

      scale.value = withSpring(1, { damping: 10, stiffness: 180 });
      ringScale.value = withDelay(100, withTiming(1.6, { duration: 600 }));
      ringOpacity.value = withDelay(
        100,
        withSequence(withTiming(0.4, { duration: 200 }), withTiming(0, { duration: 400 }))
      );
    }
  }, [badge]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  if (!badge) return null;

  const iconName = CATEGORY_ICON[badge.category] ?? "ribbon";

  return (
    <Modal transparent animationType="fade" visible={!!badge} onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text variant="label" semiBold color={Colors.primary} style={styles.label}>
            BADGE UNLOCKED
          </Text>

          <View style={styles.iconWrapper}>
            <Animated.View style={[styles.ring, ringStyle]} />
            <Animated.View style={[styles.iconBox, iconStyle]}>
              <Ionicons name={iconName} size={40} color={Colors.white} />
            </Animated.View>
          </View>

          <Text variant="h2" style={styles.name}>{badge.name}</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.desc}>
            {badge.description}
          </Text>

          <Pressable style={styles.button} onPress={onDismiss} accessibilityRole="button">
            <Text variant="body" semiBold color={Colors.white}>Nice!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.huge,
    alignItems: "center",
    gap: Spacing.base,
  },
  label: {
    letterSpacing: 1,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Spacing.lg,
  },
  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    textAlign: "center",
  },
  desc: {
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
});
