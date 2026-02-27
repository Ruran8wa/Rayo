import Mapbox from "@rnmapbox/maps";
import ENV from "@config/env";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapSearchBar } from "@components/map/map-search-bar";
import { CategoryChipRow } from "@components/map/category-chip-row";
import { Spacing } from "@constants/theme";

Mapbox.setAccessToken(ENV.mapboxToken);

export default function MapTab() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Light}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          zoomLevel={13}
          centerCoordinate={[30.0619, -1.9441]}
          animationMode="none"
        />
      </Mapbox.MapView>

      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.sm }]}>
        <MapSearchBar />
        <CategoryChipRow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
});
