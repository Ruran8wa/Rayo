import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@components/ui/text";
import { ServiceRow } from "./service-row";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import type { Floor } from "@/types";

const { width: W } = Dimensions.get("window");

interface Props {
  floor: Floor;
}

export function FloorCard({ floor }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="h2">{floor.name}</Text>
        <Text variant="caption" color={Colors.textSecondary}>↕ swipe</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {floor.services.map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: W - Spacing.xl * 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    ...Shadow.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
});
