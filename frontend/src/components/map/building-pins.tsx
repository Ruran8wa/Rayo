import Mapbox from "@rnmapbox/maps";
import React from "react";
import type { BuildingsGeoJSON } from "@/types";
import { Colors } from "@constants/theme";

interface Props {
  geojson: BuildingsGeoJSON;
  onPinPress: (buildingId: string) => void;
}

const PIN_COLORS = {
  fully: Colors.fullyAccessible,
  partial: Colors.partiallyAccessible,
  none: Colors.notAccessible,
};

export function BuildingPins({ geojson, onPinPress }: Props) {
  return (
    <Mapbox.ShapeSource
      id="buildings"
      shape={geojson}
      onPress={(e) => {
        const feature = e.features[0];
        if (feature?.properties?.id) {
          onPinPress(feature.properties.id);
        }
      }}
    >
      <Mapbox.SymbolLayer
        id="building-labels"
        style={{
          textField: ["get", "name"],
          textSize: 12,
          textColor: [
            "match",
            ["get", "accessibility_level"],
            "fully", Colors.fullyAccessible,
            "partial", Colors.partiallyAccessible,
            Colors.notAccessible,
          ],
          textHaloColor: Colors.surface,
          textHaloWidth: 2,
          textOffset: [0, 1.5],
          iconImage: "marker",
          iconSize: 1,
          iconColor: [
            "match",
            ["get", "accessibility_level"],
            "fully", Colors.fullyAccessible,
            "partial", Colors.partiallyAccessible,
            Colors.notAccessible,
          ],
        }}
      />
    </Mapbox.ShapeSource>
  );
}
