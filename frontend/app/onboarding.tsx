import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingSlide } from "@components/onboarding/slide";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { Colors, Spacing } from "@constants/theme";
import { storage } from "@utils/storage";

const { width: W } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Find accessible spaces near you",
    subtitle: "Discover buildings that are fully, partially, or not accessible — all in one map.",
  },
  {
    title: "Explore every floor & service",
    subtitle: "See which rooms on each floor are accessible to you before you arrive.",
  },
  {
    title: "Share your experience",
    subtitle: "Help the community by reviewing the accessibility of places you've visited.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  const handleContinue = () => {
    const next = Math.round(scrollX.value / W) + 1;
    if (next < SLIDES.length) {
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
    } else {
      completeOnboarding();
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
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      <View style={styles.header}>
        <Pressable onPress={completeOnboarding}>
          <Text variant="label" color={Colors.textSecondary}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((slide, i) => (
          <OnboardingSlide
            key={i}
            index={i}
            title={slide.title}
            subtitle={slide.subtitle}
            scrollX={scrollX}
          >
            <Ionicons
              name={(["map", "layers", "star"] as const)[i]}
              size={64}
              color={Colors.white}
            />
          </OnboardingSlide>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <DotIndicator key={i} index={i} scrollX={scrollX} />
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.footer}>
        <LastSlideActions
          scrollX={scrollX}
          onContinue={handleContinue}
          onCreateAccount={goToAuth}
          onGuest={completeOnboarding}
        />
      </View>
    </SafeAreaView>
  );
}

function DotIndicator({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const active = Math.round(scrollX.value / W) === index;
    return {
      width: withSpring(active ? 24 : 8, { damping: 15 }),
      opacity: withSpring(active ? 1 : 0.3, { damping: 15 }),
    };
  });
  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.primary,
          marginHorizontal: 3,
        },
        style,
      ]}
    />
  );
}

function LastSlideActions({
  scrollX,
  onContinue,
  onCreateAccount,
  onGuest,
}: {
  scrollX: SharedValue<number>;
  onContinue: () => void;
  onCreateAccount: () => void;
  onGuest: () => void;
}) {
  const isLastSlideStyle = useAnimatedStyle(() => {
    const isLast = Math.round(scrollX.value / W) === SLIDES.length - 1;
    return {
      opacity: withSpring(isLast ? 1 : 0, { damping: 15 }),
      pointerEvents: isLast ? "auto" : "none",
    };
  });
  const isNotLastSlideStyle = useAnimatedStyle(() => {
    const isNotLast = Math.round(scrollX.value / W) !== SLIDES.length - 1;
    return {
      opacity: withSpring(isNotLast ? 1 : 0, { damping: 15 }),
      pointerEvents: isNotLast ? "auto" : "none",
    };
  });

  return (
    <>
      <Animated.View style={[styles.actions, isNotLastSlideStyle]}>
        <Button label="Continue" onPress={onContinue} fullWidth />
      </Animated.View>
      <Animated.View style={[styles.actions, isLastSlideStyle]}>
        <Button label="Create an account" onPress={onCreateAccount} fullWidth />
        <Pressable onPress={onGuest} style={styles.guestLink}>
          <Text variant="label" color={Colors.textSecondary}>Continue as guest</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, alignItems: "flex-end" },
  scroll: { flex: 1 },
  dots: { flexDirection: "row", justifyContent: "center", paddingVertical: Spacing.lg },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  actions: { gap: Spacing.md },
  guestLink: { alignItems: "center", paddingVertical: Spacing.sm },
});
