import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from "@constants/theme";
import { sitesService } from "@services/api/sites.service";
import { reviewsService } from "@services/api/reviews.service";
import type { Building, Site } from "@/types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Scope = "building" | "floor" | "service";
type LocationMode = "site" | "custom";

const SCOPES: { value: Scope; label: string; sub: string }[] = [
  { value: "building", label: "Whole building", sub: "Overall impression" },
  { value: "floor", label: "Specific floor", sub: "Rate one floor" },
  { value: "service", label: "Specific service", sub: "Rate one service" },
];

const LEVELS: { value: "fully" | "partial" | "none"; label: string; color: string }[] = [
  { value: "fully", label: "Fully\nAccessible", color: Colors.fullyAccessible },
  { value: "partial", label: "Partially\nAccessible", color: Colors.partiallyAccessible },
  { value: "none", label: "Not\nAccessible", color: Colors.notAccessible },
];

export default function WriteReview() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading, refreshSession } = useAuth();

  const params = useLocalSearchParams<{
    buildingId?: string;
    buildingName?: string;
    placeName?: string;
    placeAddress?: string;
  }>();

  const [locationMode, setLocationMode] = useState<LocationMode>("site");
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  const [loadingSiteId, setLoadingSiteId] = useState<string | null>(null);
  const [siteBuildings, setSiteBuildings] = useState<Record<string, Building[]>>({});
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [customPlaceName, setCustomPlaceName] = useState("");
  const [customPlaceAddress, setCustomPlaceAddress] = useState("");

  const [scope, setScope] = useState<Scope>("building");
  const [level, setLevel] = useState<"fully" | "partial" | "none" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasParamContext = !!params.buildingId || !!params.placeName;
  const resolvedBuildingId = params.buildingId ?? selectedBuilding?.id;
  const resolvedBuildingName =
    (params.buildingName ?? selectedBuilding?.name ?? params.placeName ?? customPlaceName) || null;

  const hasLocation =
    hasParamContext ||
    selectedBuilding != null ||
    (locationMode === "custom" && customPlaceName.trim().length > 0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [user, loading]);

  useEffect(() => {
    if (hasParamContext) return;
    sitesService
      .getAll()
      .then(setSites)
      .catch(() => setSites([]))
      .finally(() => setSitesLoading(false));
  }, []);

  const handleSiteTap = async (siteId: string) => {
    if (expandedSiteId === siteId) {
      setExpandedSiteId(null);
      return;
    }
    setExpandedSiteId(siteId);
    if (siteBuildings[siteId]) return;
    setLoadingSiteId(siteId);
    try {
      const site = await sitesService.getById(siteId);
      setSiteBuildings((prev) => ({ ...prev, [siteId]: site.buildings }));
    } catch {
      setSiteBuildings((prev) => ({ ...prev, [siteId]: [] }));
    } finally {
      setLoadingSiteId(null);
    }
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setExpandedSiteId(null);
  };

  const handleSubmit = async () => {
    if (!level || !hasLocation) return;

    setSubmitting(true);
    setError(null);

    const doCreate = () =>
      reviewsService.create({
        building_id: resolvedBuildingId,
        place_name: !resolvedBuildingId
          ? (params.placeName ?? (customPlaceName.trim() || undefined))
          : undefined,
        place_address: !resolvedBuildingId
          ? (params.placeAddress ?? (customPlaceAddress.trim() || undefined))
          : undefined,
        scope,
        accessibility_level: level,
        comment: comment.trim() || undefined,
      });

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    };

    try {
      await doCreate();
      invalidate();
      router.back();
    } catch (err: any) {

      if (err?.status === 401) {
        try {
          await refreshSession();
          await doCreate();
          invalidate();
          router.back();
          return;
        } catch (refreshErr: any) {

          router.replace("/(auth)/sign-in");
          return;
        }
      }

      const msg = err?.message ?? "Unknown error";
      setError(`Submit failed (${err?.status ?? "?"}): ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text variant="label" color={Colors.textSecondary}>← Back</Text>
          </Pressable>

          <Text variant="h1" style={styles.heading}>Write a Review</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.sub}>
            Help others know what to expect
          </Text>
          {hasParamContext ? (

            <View style={styles.locationBadge}>
              <Ionicons name="location-outline" size={14} color={Colors.primary} />
              <Text variant="bodySm" semiBold numberOfLines={1} style={styles.locationBadgeText}>
                {resolvedBuildingName}
              </Text>
            </View>
          ) : selectedBuilding ? (

            <View style={styles.locationBadge}>
              <Ionicons name="business-outline" size={14} color={Colors.primary} />
              <Text variant="bodySm" semiBold numberOfLines={1} style={styles.locationBadgeText}>
                {selectedBuilding.name}
              </Text>
              <Pressable onPress={() => setSelectedBuilding(null)} style={styles.changeTap}>
                <Text variant="caption" color={Colors.textSecondary}>Change</Text>
              </Pressable>
            </View>
          ) : (

            <View style={styles.pickerSection}>
              <View style={styles.modeToggle}>
                <Pressable
                  style={[styles.modeBtn, locationMode === "site" && styles.modeBtnActive]}
                  onPress={() => setLocationMode("site")}
                  accessibilityRole="button"
                >
                  <Text
                    variant="bodySm"
                    semiBold
                    color={locationMode === "site" ? Colors.white : Colors.textSecondary}
                  >
                    Known site
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modeBtn, locationMode === "custom" && styles.modeBtnActive]}
                  onPress={() => setLocationMode("custom")}
                  accessibilityRole="button"
                >
                  <Text
                    variant="bodySm"
                    semiBold
                    color={locationMode === "custom" ? Colors.white : Colors.textSecondary}
                  >
                    Other place
                  </Text>
                </Pressable>
              </View>

              {locationMode === "site" ? (

                sitesLoading ? (
                  <ActivityIndicator color={Colors.primary} style={styles.loader} />
                ) : sites.length === 0 ? (
                  <Text variant="bodySm" color={Colors.textSecondary} style={styles.emptyMsg}>
                    No sites found.
                  </Text>
                ) : (
                  <View style={styles.siteList}>
                    {sites.map((site) => {
                      const isExpanded = expandedSiteId === site.id;
                      const buildings = siteBuildings[site.id] ?? [];
                      return (
                        <View key={site.id}>
                          <Pressable
                            style={[styles.siteRow, isExpanded && styles.siteRowExpanded]}
                            onPress={() => handleSiteTap(site.id)}
                            accessibilityRole="button"
                            accessibilityLabel={site.name}
                          >
                            <View style={styles.siteInfo}>
                              <Text variant="bodySm" semiBold numberOfLines={1}>{site.name}</Text>
                              <Text variant="caption" color={Colors.textSecondary}>
                                {site.category}
                                {site.building_count > 0 ? ` · ${site.building_count} buildings` : ""}
                              </Text>
                            </View>
                            {loadingSiteId === site.id ? (
                              <ActivityIndicator size="small" color={Colors.primary} />
                            ) : (
                              <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={Colors.textSecondary}
                              />
                            )}
                          </Pressable>

                          {isExpanded && (
                            <View style={styles.buildingList}>
                              {buildings.length === 0 ? (
                                <Text
                                  variant="caption"
                                  color={Colors.textSecondary}
                                  style={styles.emptyMsg}
                                >
                                  No buildings found in this site.
                                </Text>
                              ) : (
                                buildings.map((b) => (
                                  <Pressable
                                    key={b.id}
                                    style={styles.buildingRow}
                                    onPress={() => handleBuildingSelect(b)}
                                    accessibilityRole="button"
                                    accessibilityLabel={b.name}
                                  >
                                    <Ionicons
                                      name="business-outline"
                                      size={14}
                                      color={Colors.textSecondary}
                                    />
                                    <Text variant="bodySm" numberOfLines={1} style={styles.buildingName}>
                                      {b.name}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                                  </Pressable>
                                ))
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )
              ) : (

                <View style={styles.customInputs}>
                  <Text variant="label" semiBold color={Colors.textSecondary} style={styles.inputLabel}>
                    PLACE NAME
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={customPlaceName}
                    onChangeText={setCustomPlaceName}
                    placeholder="e.g. Kigali City Tower"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                    accessibilityLabel="Place name"
                  />
                  <Text variant="label" semiBold color={Colors.textSecondary} style={[styles.inputLabel, styles.inputLabelTop]}>
                    ADDRESS (OPTIONAL)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={customPlaceAddress}
                    onChangeText={setCustomPlaceAddress}
                    placeholder="e.g. KG 7 Ave, Kigali"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="done"
                    accessibilityLabel="Place address"
                  />
                  {customPlaceName.trim().length > 0 && (
                    <Text variant="caption" color={Colors.primary} style={styles.customHint}>
                      ✓ Fill in your rating below
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
          {hasLocation && (
            <>
              <Text
                variant="label"
                semiBold
                color={Colors.textSecondary}
                style={styles.sectionLabel}
              >
                WHAT ARE YOU REVIEWING?
              </Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="What are you reviewing?">
                {SCOPES.map((s) => (
                  <ScopeOption
                    key={s.value}
                    item={s}
                    selected={scope === s.value}
                    onSelect={() => setScope(s.value)}
                  />
                ))}
              </View>
              <Text
                variant="label"
                semiBold
                color={Colors.textSecondary}
                style={styles.sectionLabel}
              >
                ACCESSIBILITY CLASS
              </Text>
              <View style={styles.levelRow}>
                {LEVELS.map((l) => (
                  <LevelCard
                    key={l.value}
                    item={l}
                    selected={level === l.value}
                    onSelect={() => setLevel(l.value)}
                  />
                ))}
              </View>
              <Text
                variant="label"
                semiBold
                color={Colors.textSecondary}
                style={styles.sectionLabel}
              >
                YOUR COMMENT
              </Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="The ramp at the entrance works great, but the restrooms on this floor..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Your comment"
              />

              {error && (
                <Text variant="caption" color={Colors.notAccessible} style={styles.errorText}>
                  {error}
                </Text>
              )}

              <Button
                label="Submit Review"
                onPress={handleSubmit}
                loading={submitting}
                disabled={!level}
                fullWidth
                style={styles.submitBtn}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ScopeOption({
  item,
  selected,
  onSelect,
}: {
  item: (typeof SCOPES)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[styles.scopeOption, selected && styles.scopeSelected, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityLabel={`${item.label}: ${item.sub}`}
      accessibilityState={{ checked: selected }}
    >
      <View style={styles.scopeInfo}>
        <Text variant="bodySm" bold>{item.label}</Text>
        <Text variant="caption" color={Colors.textSecondary}>{item.sub}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]} />
    </AnimatedPressable>
  );
}

function LevelCard({
  item,
  selected,
  onSelect,
}: {
  item: (typeof LEVELS)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[
        styles.levelCard,
        { borderColor: selected ? item.color : Colors.border },
        selected && { backgroundColor: item.color + "15" },
        animStyle,
      ]}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={item.label.replace('\n', ' ')}
      accessibilityState={{ selected }}
    >
      <Text variant="label" color={item.color} semiBold style={styles.levelLabel}>
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  back: { marginBottom: Spacing.xxl },
  heading: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xl },

  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.base,
  },
  locationBadgeText: { flex: 1 },
  changeTap: { marginLeft: "auto" },

  pickerSection: { marginBottom: Spacing.base },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: Spacing.base,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.pill,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  loader: { marginVertical: Spacing.xl },
  emptyMsg: { textAlign: "center", marginVertical: Spacing.base },

  siteList: { gap: Spacing.sm },
  siteRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Shadow.card,
  },
  siteRowExpanded: { borderColor: Colors.primary },
  siteInfo: { flex: 1 },

  buildingList: {
    marginTop: 2,
    marginBottom: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary + "40",
    marginLeft: Spacing.base,
    paddingLeft: Spacing.base,
    gap: Spacing.xs,
  },
  buildingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buildingName: { flex: 1 },

  customInputs: { gap: Spacing.xs },
  inputLabel: { letterSpacing: 0.8, marginBottom: 4 },
  inputLabelTop: { marginTop: Spacing.base },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  customHint: { marginTop: Spacing.sm },

  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  scopeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  scopeSelected: { borderColor: Colors.primary },
  scopeInfo: { flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  levelRow: { flexDirection: "row", gap: Spacing.sm },
  levelCard: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    ...Shadow.card,
    backgroundColor: Colors.surface,
  },
  levelLabel: { textAlign: "center", lineHeight: 18 },
  commentInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    minHeight: 120,
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  errorText: { marginTop: Spacing.sm },
  submitBtn: { marginTop: Spacing.xl },
});
