import React from "react";
import { Dimensions, StyleSheet, Text as RNText, View } from "react-native";
import { Colors, FontFamily, FontSize, Spacing } from "@constants/theme";
import { Text } from "@components/ui/text";

const { width: W, height: H } = Dimensions.get("window");
const TOP_HEIGHT = H * 0.44;

interface Props {
  stepNumber: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  footer: React.ReactNode;
}

export function OnboardingSlide({
  stepNumber,
  title,
  subtitle,
  illustration,
  footer,
}: Props) {
  return (
    <View style={styles.slide}>
      {/* Top — dark green illustration zone */}
      <View style={styles.top}>{illustration}</View>

      {/* Bottom — white card */}
      <View style={styles.card}>
        <View style={styles.badge}>
          <RNText style={styles.badgeText}>{stepNumber}</RNText>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.footerSlot}>{footer}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: W,
    height: H,
    backgroundColor: Colors.primary,
  },
  top: {
    height: TOP_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5EE",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.label,
    color: Colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: 30,
    color: Colors.textPrimary,
    lineHeight: 36,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  footerSlot: {
    marginTop: "auto",
  },
});
