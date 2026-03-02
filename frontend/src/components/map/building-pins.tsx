import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { AccessibilityLevel, BuildingsGeoJSON } from "@/types";

interface Props {
  geojson: BuildingsGeoJSON;
  onPinPress: (buildingId: string) => void;
}

const LEVEL_COLOR: Record<AccessibilityLevel, string> = {
  fully:   Colors.fullyAccessible,
  partial: Colors.partiallyAccessible,
  none:    Colors.notAccessible,
  unknown: "#9E9E9E",
};

export function BuildingPins({ geojson, onPinPress }: Props) {
  if (!geojson.features?.length) return null;

  return (
    <>
      {geojson.features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const { id, name, accessibility_level } = feature.properties;
        const color = LEVEL_COLOR[accessibility_level] ?? LEVEL_COLOR.unknown;

        return (
          <Marker
            key={id}
            coordinate={{ latitude: lat, longitude: lng }}
            onPress={() => onPinPress(id)}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={[styles.pin, { backgroundColor: color }]}>
              <Text style={styles.label} numberOfLines={1}>{name}</Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  pin: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    maxWidth: 140,
  },
  label: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: "600",
  },
});
