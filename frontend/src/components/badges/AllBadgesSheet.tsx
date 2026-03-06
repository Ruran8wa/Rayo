import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { Badge } from "@/types";

const CATEGORY_ICON: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  community: "star",
  explorer: "compass",
  impact: "ribbon",
};

interface Props {
  badges: Badge[];
  visible: boolean;
  onClose: () => void;
}

export function AllBadgesSheet({ badges, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.handle} />
          <Text variant="h3" style={styles.title}>All Badges</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {badges.map((badge) => (
                <BadgeGridItem key={badge.id} badge={badge} />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function BadgeGridItem({ badge }: { badge: Badge }) {
  const iconName = CATEGORY_ICON[badge.category] ?? "ribbon";
  const progress = Math.min(badge.progress ?? 0, badge.required ?? 1);
  const required = badge.required ?? 1;
  const pct = required > 0 ? progress / required : 0;

  return (
    <View style={[styles.item, !badge.earned && styles.itemLocked]}>
      <View style={[styles.iconBox, !badge.earned && styles.iconBoxLocked]}>
        <Ionicons name={iconName} size={28} color={badge.earned ? Colors.white : Colors.textSecondary} />
      </View>
      <Text variant="caption" semiBold style={styles.itemName} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text variant="caption" color={Colors.textSecondary} style={styles.itemReq} numberOfLines={2}>
        {badge.requirement}
      </Text>
      {badge.earned ? (
        <Text variant="caption" color={Colors.primary} semiBold>Earned</Text>
      ) : (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          <Text variant="caption" color={Colors.textSecondary} style={styles.progressLabel}>
            {progress} / {required}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.base,
  },
  title: { marginBottom: Spacing.lg },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  item: {
    width: "47%",
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: "center",
    gap: Spacing.xs,
  },
  itemLocked: { opacity: 0.6 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  iconBoxLocked: { backgroundColor: Colors.border },
  itemName: { textAlign: "center" },
  itemReq: { textAlign: "center" },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabel: { marginTop: 2, textAlign: "center" },
});
