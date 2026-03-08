import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccessibilityBadge } from "@components/ui/accessibility-badge";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, Spacing } from "@constants/theme";
import { sitesService } from "@services/api/sites.service";

export default function SiteDetail() {
  const params = useLocalSearchParams<{ id: string | string[]; name?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const fallbackName = Array.isArray(params.name) ? params.name[0] : params.name;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: site, isLoading, isError } = useQuery({
    queryKey: ["site", id],
    queryFn: () => sitesService.getById(id!),
    enabled: !!id,
  });

  const displayName = site?.name ?? fallbackName ?? "Site";

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </Pressable>
        <Text variant="h1" color={Colors.white} style={styles.name} numberOfLines={2}>
          {displayName}
        </Text>
        {site?.address ? (
          <Text variant="caption" color={Colors.white + "99"} style={styles.address}>
            {site.address}
          </Text>
        ) : null}
        {site && (
          <View style={styles.countBadge}>
            <Ionicons name="business-outline" size={12} color={Colors.white} />
            <Text variant="caption" color={Colors.white}>
              {site.buildings.length} building{site.buildings.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : isError || !site ? (
        <View style={styles.center}>
          <Text variant="body" color={Colors.textSecondary}>Could not load site details.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text variant="label" color={Colors.textSecondary} semiBold style={styles.listLabel}>
            BUILDINGS
          </Text>
          {site.buildings.map((building, i) => (
            <Pressable
              key={building.id}
              style={[styles.row, i < site.buildings.length - 1 && styles.rowBorder]}
              onPress={() =>
                router.push({
                  pathname: "/building/[id]",
                  params: { id: building.id, siteId: site.id, siteName: site.name },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`View ${building.name}`}
            >
              <View style={styles.rowInfo}>
                <Text variant="bodySm" semiBold numberOfLines={1}>{building.name}</Text>
                {building.floor_count > 0 && (
                  <Text variant="caption" color={Colors.textSecondary}>
                    {building.floor_count} floor{building.floor_count !== 1 ? "s" : ""}
                  </Text>
                )}
              </View>
              <AccessibilityBadge level={building.accessibility_level} />
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.white + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
    alignSelf: "flex-start",
  },
  name: { marginBottom: Spacing.xs },
  address: { marginBottom: Spacing.base },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.white + "40",
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.base,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.huge },
  listLabel: { marginBottom: Spacing.base, letterSpacing: 0.8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  rowBorder: {},
  rowInfo: { flex: 1 },
});
