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
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { Colors, BorderRadius, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      triggerShake();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text variant="label" color={Colors.textSecondary}>← Back</Text>
          </Pressable>

          <Text variant="h1" style={styles.heading}>Welcome back</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.sub}>
            Sign in to your account
          </Text>

          <Animated.View style={shakeStyle}>
            <View style={styles.field}>
              <Text variant="label" semiBold style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text variant="label" semiBold style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
              />
            </View>

            {error && (
              <Text variant="caption" color={Colors.notAccessible} style={styles.error}>
                {error}
              </Text>
            )}
          </Animated.View>

          <Button label="Sign in" onPress={handleSignIn} loading={loading} fullWidth style={styles.btn} />

          <Pressable onPress={() => router.push("/eula?context=signup")} style={styles.link}>
            <Text variant="label" color={Colors.textSecondary}>
              Don't have an account?{" "}
              <Text variant="label" color={Colors.primary} semiBold>Create account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.xl },
  back: { marginBottom: Spacing.xxl },
  heading: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xxl },
  field: { marginBottom: Spacing.base },
  label: { marginBottom: Spacing.xs, letterSpacing: 0.8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  error: { marginBottom: Spacing.base },
  btn: { marginTop: Spacing.lg },
  link: { alignItems: "center", marginTop: Spacing.xl },
});
