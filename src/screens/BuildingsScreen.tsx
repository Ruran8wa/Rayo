import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function BuildingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="business" size={48} color="#10B981" />
        <Text style={styles.title}>Buildings</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Browse and explore buildings, properties, and real estate locations in
          your area.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
