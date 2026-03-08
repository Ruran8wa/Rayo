import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { OnboardingSlide } from "@components/onboarding/slide";
import { MapIllustration } from "@components/onboarding/illustrations/MapIllustration";
import { FloorIllustration } from "@components/onboarding/illustrations/FloorIllustration";
import { ReviewIllustration } from "@components/onboarding/illustrations/ReviewIllustration";
import { Button } from "@components/ui/button";
import { Colors, FontFamily, FontSize, Spacing } from "@constants/theme";
import { storage } from "@utils/storage";

const { width: W } = Dimensions.get("window");

const SLIDES = [
  {
    stepNumber: "01",
    title: "Find accessible spaces near you",
    subtitle:
      "See which public buildings are fully, partially, or not accessible — all on a live map.",
    Illustration: MapIllustration,
  },
  {
    stepNumber: "02",
    title: "Explore every floor & service",
    subtitle:
      "Drill into any building to see which services on each floor are accessible to you.",
    Illustration: FloorIllustration,
  },
  {
    stepNumber: "03",
    title: "Share your experience",
    subtitle:
      "Help the community by reviewing the accessibility of places you've visited.",
    Illustration: ReviewIllustration,
  },
];

const TOTAL = SLIDES.length;

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setCurrentIndex(idx);
  };

  const handleContinue = (fromIndex: number) => {
    const next = fromIndex + 1;
    if (next < TOTAL) {
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
    }
  };

  const completeOnboarding = async () => {
    await storage.set("hasSeenOnboarding", true);
    router.replace("/(tabs)");
  };

  const goToAuth = async () => {
    await storage.set("hasSeenOnboarding", true);
    router.replace("/(auth)/register");
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.scroll}
    >
      {SLIDES.map((slide, i) => {
        const { stepNumber, title, subtitle, Illustration } = slide;
        const isLast = i === TOTAL - 1;
        return (
          <OnboardingSlide
            key={stepNumber}
            stepNumber={stepNumber}
            title={title}
            subtitle={subtitle}
            illustration={<Illustration />}
            footer={
              <SlideFooter
                total={TOTAL}
                activeIndex={currentIndex}
                slideIndex={i}
                isLast={isLast}
                onContinue={() => handleContinue(i)}
                onCreateAccount={goToAuth}
                onSkip={completeOnboarding}
              />
            }
          />
        );
      })}
    </ScrollView>
  );
}

interface SlideFooterProps {
  total: number;
  activeIndex: number;
  slideIndex: number;
  isLast: boolean;
  onContinue: () => void;
  onCreateAccount: () => void;
  onSkip: () => void;
}

function SlideFooter({
  total,
  activeIndex,
  slideIndex,
  isLast,
  onContinue,
  onCreateAccount,
  onSkip,
}: SlideFooterProps) {
  const isVisible = activeIndex === slideIndex;

  return (
    <View style={[footerStyles.container, { pointerEvents: isVisible ? "auto" : "none" }]}>
      <View style={footerStyles.dots}>
        {Array.from({ length: total }).map((_, di) => (
          <View
            key={di}
            style={[
              footerStyles.dot,
              di === activeIndex ? footerStyles.dotActive : footerStyles.dotInactive,
            ]}
          />
        ))}
      </View>

      {isLast ? (
        <>
          <Button label="Create an account" onPress={onCreateAccount} fullWidth />
          <Pressable onPress={onSkip} style={footerStyles.ghost} accessibilityRole="button" accessibilityLabel="Continue as guest">
            <RNText style={footerStyles.ghostText}>Continue as guest</RNText>
          </Pressable>
        </>
      ) : (
        <>
          <Button label="Continue" onPress={onContinue} fullWidth />
          <Pressable onPress={onSkip} style={footerStyles.ghost} accessibilityRole="button" accessibilityLabel="Skip onboarding">
            <RNText style={footerStyles.ghostText}>Skip for now</RNText>
          </Pressable>
        </>
      )}
    </View>
  );
}

const footerStyles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.primary + "33",
  },
  ghost: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  ghostText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
});
