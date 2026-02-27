import Mapbox from "@rnmapbox/maps";
import ENV from "@config/env";
import { StyleSheet, View } from "react-native";

Mapbox.setAccessToken(ENV.mapboxToken);

export default function MapTab() {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
