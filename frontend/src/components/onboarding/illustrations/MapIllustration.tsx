import React from "react";
import { View, StyleSheet } from "react-native";

const CELL = 72;
const GAP = 6;
const PIN_SIZE = 16;

export function MapIllustration() {
  return (
    <View style={styles.container}>
      {/* 2x2 grid */}
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.cell} />
        ))}
      </View>

      {/* Horizontal divider line */}
      <View style={[styles.line, styles.lineH]} />
      {/* Vertical divider line */}
      <View style={[styles.line, styles.lineV]} />

      {/* Pins */}
      <Pin color="#1D3D2F" style={{ top: CELL * 0.3, left: CELL * 0.35 }} />
      <Pin color="#F59E0B" style={{ top: CELL * 0.2, left: CELL + GAP + CELL * 0.45 }} />
      <Pin color="#EF4444" style={{ top: CELL + GAP + CELL * 0.35, left: CELL * 0.55 }} />
    </View>
  );
}

function Pin({ color, style }: { color: string; style: object }) {
  return (
    <View style={[styles.pinWrapper, style]}>
      <View style={[styles.pinDot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CELL * 2 + GAP,
    height: CELL * 2 + GAP,
    position: "relative",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  line: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  lineH: {
    height: 1.5,
    left: 0,
    right: 0,
    top: CELL + GAP / 2,
  },
  lineV: {
    width: 1.5,
    top: 0,
    bottom: 0,
    left: CELL + GAP / 2,
  },
  pinWrapper: {
    position: "absolute",
    alignItems: "center",
  },
  pinDot: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
});
