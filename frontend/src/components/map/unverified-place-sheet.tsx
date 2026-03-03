import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "@components/ui/button";
import { SimpleSheet } from "@components/ui/simple-sheet";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import type { PlaceDetail } from "@services/api/places.service";

interface Props {
  place: PlaceDetail | null;
  onClose: () => void;
}

export function UnverifiedPlaceSheet({ place, onClose }: Props) {
  const router = useRouter();

  return (
    <SimpleSheet visible={place != null} onClose={onClose}>
      {place && (
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text variant="h2">{place.name}</Text>
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.address}>
                {place.address}
              </Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="help-circle-outline" size={14} color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary} semiBold>
                Unknown
              </Text>
            </View>
          </View>

          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary} style={styles.noticeText}>
              This place isn't in our system yet. Be the first to review its accessibility.
            </Text>
          </View>

          <Button
            label="Write the first review"
            onPress={() => {
              onClose();
              router.push("/review/new");
            }}
            fullWidth
            style={styles.btn}
          />
        </View>
      )}
    </SimpleSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing.lg, gap: Spacing.base },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: { flex: 1, marginRight: Spacing.base },
  address: { marginTop: Spacing.xs },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
  },
  noticeText: { flex: 1, lineHeight: 18 },
  btn: { marginTop: Spacing.xs },
});
