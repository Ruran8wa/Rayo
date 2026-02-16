import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";

const { height } = Dimensions.get("window");

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      minZoom: 11,
      maxZoom: 18
    }).setView([-1.9536, 30.0606], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var kigaliBounds = [
      [-2.0500, 29.9500],
      [-1.8500, 30.2000]
    ];
    map.setMaxBounds(kigaliBounds);

    var locations = [
      { name: 'Kigali Convention Centre', lat: -1.9536, lng: 30.0927 },
      { name: 'Kimihurura', lat: -1.9442, lng: 30.0887 },
      { name: 'City Centre', lat: -1.9536, lng: 30.0606 },
      { name: 'Nyarugenge', lat: -1.9706, lng: 30.0587 },
      { name: 'Remera', lat: -1.9536, lng: 30.1126 },
      { name: 'Gikondo', lat: -2.0006, lng: 30.0606 }
    ];

    var customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #10B981; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);"><div style="width: 8px; height: 8px; background: white; border-radius: 50%; position: absolute; top: 7px; left: 7px; transform: rotate(45deg);"></div></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    locations.forEach(function(loc) {
      L.marker([loc.lat, loc.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup('<div style="font-size: 14px; font-weight: 600; color: #1f2937; padding: 4px 0;">' + loc.name + '</div>');
    });
  </script>
</body>
</html>
`;

const categories = [
  { id: 1, name: "Schools", icon: "school-outline" },
  { id: 2, name: "Government", icon: "business-outline" },
  { id: 3, name: "Banks", icon: "cash-outline" },
];

const services = [
  {
    id: 1,
    name: "RRA",
    address: "KG 03 Avenue, Kigali",
    status: "Open",
    opensAt: "9am",
    icon: "business",
    accessible: true,
  },
  {
    id: 2,
    name: "UR Remera",
    address: "KG 29 Avenue, Kigali",
    status: "Open",
    opensAt: "9am",
    icon: "school",
    accessible: true,
  },
  {
    id: 3,
    name: "Bpr Bank",
    address: "Kk 13 Avenue, Kigali",
    status: "Closed",
    opensAt: "9am",
    icon: "cash",
    accessible: true,
  },
  {
    id: 4,
    name: "Equity Bank",
    address: "KG 29 Avenue, Kigali",
    status: "Open",
    opensAt: "9am",
    icon: "cash",
    accessible: false,
  },
  {
    id: 5,
    name: "Bk Bank",
    address: "KN 41 Avenue, Kigali",
    status: "Closed",
    opensAt: "9am",
    icon: "cash",
    accessible: true,
  },
  {
    id: 6,
    name: "Kepler College",
    address: "KG 29 Avenue, Kigali",
    status: "Open",
    opensAt: "9am",
    icon: "school",
    accessible: true,
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const webViewRef = useRef<WebView>(null);

  const minHeight = height * 0.15;
  const maxHeight = height * 0.8;
  const translateY = useRef(new Animated.Value(height - minHeight)).current;
  const currentSheetHeight = useRef(minHeight);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = height - minHeight - gestureState.dy;
        if (newY >= minHeight && newY <= maxHeight) {
          translateY.setValue(height - newY);
          currentSheetHeight.current = newY;
        }
      },
      onPanResponderRelease: () => {
        const threshold = (minHeight + maxHeight) / 2;

        Animated.spring(translateY, {
          toValue:
            currentSheetHeight.current < threshold
              ? height - minHeight
              : height - maxHeight,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
        }).start(() => {
          currentSheetHeight.current =
            currentSheetHeight.current < threshold ? minHeight : maxHeight;
        });
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: LEAFLET_HTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="map-outline" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryButton}>
              <Ionicons name={category.icon as any} size={18} color="#333" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHandle}>
          <View style={styles.handleBar} />
        </View>

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Services near you</Text>

          <View style={styles.filtersRow}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={18} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>Sort by</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>Open now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>Fully Accessible</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.sheetContent}>
          {services.map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons name={service.icon as any} size={28} color="#333" />
              </View>

              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceAddress}>{service.address}</Text>
                <View style={styles.serviceStatus}>
                  <Text
                    style={[
                      styles.statusText,
                      service.status === "Open"
                        ? styles.statusOpen
                        : styles.statusClosed,
                    ]}
                  >
                    {service.status}
                  </Text>
                  <Text style={styles.statusDot}>·</Text>
                  <Text style={styles.opensAtText}>
                    Opens at {service.opensAt}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.accessibilityBadge,
                  {
                    backgroundColor: service.accessible ? "#10B981" : "#F59E0B",
                  },
                ]}
              >
                <Ionicons name="accessibility" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    marginTop: 12,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    gap: 4,
  },
  filterText: {
    fontSize: 13,
    color: "#666",
  },
  sheetContent: {
    flex: 1,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    gap: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  serviceAddress: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  serviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statusOpen: {
    color: "#10B981",
  },
  statusClosed: {
    color: "#EF4444",
  },
  statusDot: {
    fontSize: 13,
    color: "#9ca3af",
  },
  opensAtText: {
    fontSize: 13,
    color: "#6b7280",
  },
  accessibilityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
