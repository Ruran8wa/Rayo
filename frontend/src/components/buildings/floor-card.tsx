import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@components/ui/text";
import { ServiceRow } from "./service-row";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";
import { useAuth } from "@contexts/AuthContext";
import type { Floor } from "@/types";

const { width: W } = Dimensions.get("window");

const EMPHASIS: Record<string, "mobility" | "visual" | "hearing"> = {
  mobility: "mobility",
  "mobility impairment": "mobility",
  visual: "visual",
  "visual impairment": "visual",
  hearing: "hearing",
  "hearing impairment": "hearing",
};

interface Pill {
  key: "mobility" | "visual" | "hearing";
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  supported: boolean;
}

interface Props {
  floor: Floor;
}

export function FloorCard({ floor }: Props) {
  const { user } = useAuth();
  const userNeed = user?.disability_type
    ? EMPHASIS[user.disability_type.toLowerCase()] ?? null
    : null;

  const pills: Pill[] = [
    {
      key: "mobility",
      label: "Mobility",
      icon: "walk-outline",
      supported: floor.mobility_accessible,
    },
    {
      key: "visual",
      label: "Visual",
      icon: "eye-outline",
      supported: floor.clear_signage || floor.high_contrast_signage,
    },
    {
      key: "hearing",
      label: "Hearing",
      icon: "ear-outline",
      supported: floor.clear_signage,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="h2">{floor.name}</Text>
        <Text variant="caption" color={Colors.textSecondary}>↕ swipe</Text>
      </View>
      <View style={styles.pills}>
        {pills.map((pill) => {
          const isEmphasisised = pill.key === userNeed;
          const fg = pill.supported ? Colors.fullyAccessible : Colors.notAccessible;
          return (
            <View
              key={pill.key}
              style={[
                styles.pill,
                { borderColor: fg + (isEmphasisised ? "CC" : "55"), backgroundColor: fg + (isEmphasisised ? "18" : "0D") },
                isEmphasisised && styles.pillEmphasised,
              ]}
            >
              <Ionicons name={pill.icon} size={13} color={fg} />
              <Text variant="caption" semiBold={isEmphasisised} color={fg}>
                {pill.label}
              </Text>
              <Ionicons
                name={pill.supported ? "checkmark" : "close"}
                size={12}
                color={fg}
              />
            </View>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {(floor.services ?? []).map((s) => (
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
    marginBottom: Spacing.sm,
  },
  pills: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  pillEmphasised: {
    borderWidth: 1.5,
  },
});
