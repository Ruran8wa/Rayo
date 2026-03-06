import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export function FloorIllustration() {
  return (
    <View style={styles.card}>
      {/* Green status dot top right */}
      <View style={styles.statusDot} />

      {/* Title bar */}
      <View style={[styles.bar, { width: "70%", height: 10, marginBottom: 14 } as ViewStyle]} />

      {/* Row items */}
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.bar, { width: 24, height: 24, borderRadius: 6, marginRight: 10 } as ViewStyle]} />
          <View style={styles.rowText}>
            <View style={[styles.bar, { width: "60%", height: 8 } as ViewStyle]} />
            <View style={[styles.bar, { width: "40%", height: 6 } as ViewStyle]} />
          </View>
          <View style={[styles.statusBar, i === 2 ? styles.statusYellow : styles.statusWhite]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 14,
    padding: 16,
    position: "relative",
  },
  statusDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  bar: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rowText: {
    flex: 1,
    gap: 5,
  },
  statusBar: {
    width: 36,
    height: 8,
    borderRadius: 4,
  },
  statusWhite: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statusYellow: {
    backgroundColor: "#F59E0B",
  },
});
