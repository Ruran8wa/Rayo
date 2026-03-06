import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function ReviewIllustration() {
  return (
    <View style={styles.card}>
      {/* Avatar row */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="rgba(255,255,255,0.5)" />
        </View>
        <View style={styles.avatarText}>
          <View style={[styles.bar, { width: "55%", height: 8 } as ViewStyle]} />
          <View style={[styles.bar, { width: "40%", height: 6 } as ViewStyle]} />
        </View>
      </View>

      {/* Stars */}
      <View style={styles.stars}>
        {[0, 1, 2].map((i) => (
          <Ionicons key={i} name="star" size={22} color="rgba(255,255,255,0.55)" />
        ))}
        {[3, 4].map((i) => (
          <Ionicons key={i} name="star-outline" size={22} color="rgba(255,255,255,0.3)" />
        ))}
      </View>

      {/* Text bars */}
      <View style={styles.textBars}>
        <View style={[styles.bar, { width: "85%", height: 7 } as ViewStyle]} />
        <View style={[styles.bar, { width: "70%", height: 7 } as ViewStyle]} />
      </View>

      {/* Tag chips */}
      <View style={styles.chips}>
        {[60, 80].map((w, i) => (
          <View key={i} style={[styles.chip, { width: w } as ViewStyle]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 14,
    padding: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    flex: 1,
    gap: 5,
  },
  bar: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  textBars: {
    gap: 6,
    marginTop: 12,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
