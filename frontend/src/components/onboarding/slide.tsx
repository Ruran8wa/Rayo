import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Colors, Spacing } from "@constants/theme";
import { Text } from "@components/ui/text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  index: number;
  title: string;
  subtitle: string;
  scrollX: SharedValue<number>;
  children?: React.ReactNode; // illustration slot
}

export function OnboardingSlide({ index, title, subtitle, scrollX, children }: Props) {
  const animatedStyle = useAnimatedStyle(() => {
    const offset = scrollX.value - index * SCREEN_WIDTH;
    const opacity = 1 - Math.abs(offset / SCREEN_WIDTH);
    return { opacity };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.illustration}>{children}</View>
        <Text variant="h1" style={styles.title}>{title}</Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
          {subtitle}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
  },
  content: {
    flex: 1,
  },
  illustration: {
    height: 280,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    lineHeight: 24,
  },
});
