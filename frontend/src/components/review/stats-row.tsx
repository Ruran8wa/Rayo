import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Shadow, Spacing } from "@constants/theme";

interface Stat {
  label: string;
  value: number;
}

interface Props {
  stats: Stat[];
}

export function StatsRow({ stats }: Props) {
  return (
    <View style={styles.row}>
      {stats.map((s) => (
        <View key={s.label} style={styles.card}>
          <Text variant="h1">{s.value}</Text>
          <Text variant="caption" color={Colors.textSecondary} style={styles.label}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  card: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    ...Shadow.card,
  },
  label: {
    textAlign: "center",
  },
});
