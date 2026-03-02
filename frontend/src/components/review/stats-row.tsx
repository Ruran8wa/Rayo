import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@components/ui/text";
import { Colors, Spacing } from "@constants/theme";

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
        <StatItem key={s.label} stat={s} />
      ))}
    </View>
  );
}

function StatItem({ stat }: { stat: Stat }) {
  return (
    <View style={styles.item}>
      <Text variant="h1">{stat.value}</Text>
      <Text variant="caption" color={Colors.textSecondary}>{stat.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-around", paddingVertical: Spacing.base },
  item: { alignItems: "center", gap: Spacing.xs },
});
