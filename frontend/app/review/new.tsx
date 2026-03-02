import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@components/ui/text";
import { Colors, Spacing } from "@constants/theme";

export default function WriteReview() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text variant="label" color={Colors.textSecondary}>← Back</Text>
      </Pressable>
      <Text variant="h1" style={styles.heading}>Write a Review</Text>
      <Text variant="body" color={Colors.textSecondary}>Coming soon</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  back: { marginBottom: Spacing.xl },
  heading: { marginBottom: Spacing.sm },
});
