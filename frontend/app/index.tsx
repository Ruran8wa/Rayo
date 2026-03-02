import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@contexts/AuthContext";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text as RNText, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Colors, FontFamily } from "@constants/theme";
import { storage } from "@utils/storage";

const { width: W } = Dimensions.get("window");
const RING_SIZE = W * 1.65;

function RadarRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.08);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.08, { duration: 0 }),
          withTiming(1, { duration: 2800, easing: Easing.out(Easing.cubic) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.35, { duration: 0 }),
          withTiming(0, { duration: 2800, easing: Easing.out(Easing.cubic) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.ringWrapper]}>
      <Animated.View style={[styles.ring, animatedStyle]} />
    </View>
  );
}

export default function Index() {
  const { loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    storage.get<boolean>("hasSeenOnboarding").then((val) => {
      setHasOnboarded(!!val);
    });
  }, []);

  if (!loading && hasOnboarded !== null) {
    if (!hasOnboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <RadarRing delay={0} />
      <RadarRing delay={933} />
      <RadarRing delay={1866} />

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="location-sharp" size={34} color={Colors.white} />
        </View>
        <RNText style={styles.brand}>rayo</RNText>
        <RNText style={styles.tagline}>Every space, made clear.</RNText>
      </View>

      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  content: {
    alignItems: "center",
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  brand: {
    fontFamily: FontFamily.heading,
    fontSize: 40,
    color: Colors.white,
    letterSpacing: 1,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.white + "99",
    letterSpacing: 0.2,
  },
  dotsRow: {
    position: "absolute",
    bottom: 52,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white + "55",
  },
});
