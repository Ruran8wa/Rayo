import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  BackHandler,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text as RNText } from "react-native";

// Local color tokens — EULA-specific palette
const C = {
  bg: "#FAFAF7",
  headerBg: "#1C3D29",
  headerText: "#F6F2EB",
  sectionHeading: "#2D5A3D",
  bodyText: "#182B1F",
  secondaryText: "#4A6854",
  mutedText: "#7A9882",
  divider: "#EDE8DF",
  acceptBg: "#2D5A3D",
  acceptText: "#F6F2EB",
  acceptDisabled: "#A8BFB0",
  declineText: "#C0392B",
  scrollHint: "#A8BFB0",
  bottomBarBg: "#FFFFFF",
  bottomBarBorder: "#EDE8DF",
};

// Typography helpers — uses project fonts loaded in app/index.tsx
function Heading({ children, style }: { children: string; style?: object }) {
  return (
    <RNText style={[{ fontFamily: "DMSerifDisplay_400Regular", fontSize: 15, color: C.sectionHeading, marginBottom: 6, marginTop: 20 }, style]}>
      {children}
    </RNText>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <RNText style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, color: C.bodyText }}>
      {children}
    </RNText>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: C.divider, marginVertical: 20 }} />;
}

export default function EULAScreen() {
  const { context } = useLocalSearchParams<{ context: "signup" | "profile" }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isProfile = context === "profile";
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrolledToBottom) return;
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    if (isAtBottom) setScrolledToBottom(true);
  };

  const handleAccept = () => {
    router.replace("/(auth)/register");
  };

  const handleDecline = () => {
    Alert.alert(
      "Are you sure?",
      "You must accept the Terms of Use and Privacy Policy to use Rayo. Declining will close the app.",
      [
        { text: "Go Back", style: "cancel" },
        {
          text: "Exit App",
          style: "destructive",
          onPress: () => {
            if (Platform.OS === "android") {
              BackHandler.exitApp();
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.headerBg, paddingTop: insets.top }}>
        <View style={styles.header}>
          {isProfile && (
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={C.headerText} />
            </Pressable>
          )}
          {/* Logo mark */}
          <View style={styles.logoMark}>
            <RNText style={{ fontFamily: "DMSerifDisplay_400Regular", fontSize: 14, color: C.headerBg, fontWeight: "600" }}>R</RNText>
          </View>
          <RNText style={styles.headerTitle}>Terms of Use & Privacy Policy</RNText>
          {/* Spacer to keep title centred when back button is shown */}
          {isProfile && <View style={{ width: 22 + 16 }} />}
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
      >
        <RNText style={styles.lastUpdated}>Last updated: March 2026</RNText>

        <Heading style={{ marginTop: 4 }}>1. Introduction</Heading>
        <Body>
          Rayo is a mobile application that helps people with disabilities find and assess the accessibility of public service buildings in Kigali, Rwanda. By creating an account or using Rayo, you agree to be bound by these Terms of Use and our Privacy Policy. Please read both carefully before proceeding. If you do not agree, you may not use the application.
        </Body>

        <Divider />

        <Heading>2. Who We Are</Heading>
        <Body>
          Rayo is developed as a capstone research project. The application is currently in a research and prototype phase and is not yet a commercial product. Queries related to this application may be directed to p.rurangwa@alustudent.com.
        </Body>

        <Divider />

        <Heading>3. What Data We Collect</Heading>
        <Body>
          When you create an account, we collect:{"\n"}
          {"• "}Your name and email address, used to identify your account.{"\n"}
          {"• "}Your disability type (mobility, visual, or hearing impairment), used solely to personalise your interface settings and improve your experience within the app. This information is never shared publicly or exposed in any building review or map data.{"\n\n"}
          When you use the app, we may also collect:{"\n"}
          {"• "}Building accessibility reviews and ratings you submit.{"\n"}
          {"• "}Photos of buildings you upload.{"\n"}
          {"• "}Approximate location, used only to show nearby buildings on the map and not stored persistently.
        </Body>

        <Divider />

        <Heading>4. How We Use Your Data</Heading>
        <Body>
          We use your data to:{"\n"}
          {"• "}Operate and personalise your Rayo experience.{"\n"}
          {"• "}Display your reviews and contributions in the building directory.{"\n"}
          {"• "}Improve the accessibility dataset and ML classification model that powers Rayo.{"\n"}
          {"• "}Communicate with you about your account if necessary.{"\n\n"}
          We do not sell your data. We do not share your data with advertisers. Your disability type is never surfaced in public-facing features of the application.
        </Body>

        <Divider />

        <Heading>5. Data Storage and Security</Heading>
        <Body>
          Your data is stored securely using Supabase, a cloud database platform. We apply row-level security policies to ensure that your personal data is only accessible to you and authorised system processes. Your disability type is stored as a private user preference and is not included in any public API response.{"\n\n"}
          As Rayo is currently a research prototype, we advise you not to submit sensitive personal information beyond what is required for registration.
        </Body>

        <Divider />

        <Heading>6. Your Rights</Heading>
        <Body>
          Under Rwanda's Law No. 058/2021 on Personal Data Protection and Privacy, you have the right to:{"\n"}
          {"• "}Access the personal data we hold about you.{"\n"}
          {"• "}Request correction of inaccurate data.{"\n"}
          {"• "}Request deletion of your account and associated personal data.{"\n"}
          {"• "}Withdraw consent at any time by deleting your account.{"\n\n"}
          To exercise any of these rights, contact us at p.rurangwa@alustudent.com.
        </Body>

        <Divider />

        <Heading>7. Crowdsourced Data and Accuracy</Heading>
        <Body>
          Rayo's building accessibility information is generated through a combination of user-submitted reviews and machine learning classification. While we strive for accuracy, we cannot guarantee that all accessibility information is current, complete, or correct. Building conditions change over time.{"\n\n"}
          You are encouraged to verify accessibility information directly with a building before visiting. Rayo accepts no liability for decisions made based on accessibility classifications displayed in the app.
        </Body>

        <Divider />

        <Heading>8. User Conduct</Heading>
        <Body>
          By using Rayo, you agree not to:{"\n"}
          {"• "}Submit false, misleading, or malicious accessibility reviews.{"\n"}
          {"• "}Upload photos that contain personally identifiable information about other individuals without their consent.{"\n"}
          {"• "}Attempt to reverse-engineer, scrape, or otherwise misuse the Rayo platform or its data.{"\n"}
          {"• "}Use the application for any purpose that violates Rwandan law or the rights of others.{"\n\n"}
          We reserve the right to remove content or suspend accounts that violate these conditions.
        </Body>

        <Divider />

        <Heading>9. Intellectual Property</Heading>
        <Body>
          The Rayo application, its design system, logo, and underlying code are the intellectual property of the developer. User-submitted review content remains the property of the submitting user, but by submitting content you grant Rayo a non-exclusive licence to display and use that content within the application.
        </Body>

        <Divider />

        <Heading>10. Limitation of Liability</Heading>
        <Body>
          Rayo is provided on an "as is" basis for research and prototype purposes. To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for any direct, indirect, or consequential damages arising from your use of the application.
        </Body>

        <Divider />

        <Heading>11. Changes to These Terms</Heading>
        <Body>
          We may update these Terms of Use and Privacy Policy from time to time. Continued use of the application after changes are posted constitutes acceptance of the revised terms. The "Last updated" date at the top of this document will reflect any changes.
        </Body>

        <Divider />

        <Heading>12. Governing Law</Heading>
        <Body>
          These terms are governed by the laws of the Republic of Rwanda, including Law No. 058/2021 relating to the protection of personal data and privacy.
        </Body>

        <Divider />

        <Heading>13. Contact</Heading>
        <Body>
          For any questions about these terms or your data, contact:{"\n"}
          Prince Rurangwa{"\n"}
          p.rurangwa@alustudent.com
        </Body>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 8, backgroundColor: C.bottomBarBg, borderTopColor: C.bottomBarBorder },
        ]}
      >
        {isProfile ? (
          <Pressable
            onPress={handleClose}
            style={[styles.acceptBtn, { backgroundColor: C.acceptBg }]}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <RNText style={[styles.acceptBtnText, { color: C.acceptText }]}>Close</RNText>
          </Pressable>
        ) : (
          <>
            {!scrolledToBottom && (
              <RNText style={[styles.scrollHint, { color: C.scrollHint }]}>
                Scroll to the bottom to continue
              </RNText>
            )}
            <Pressable
              onPress={scrolledToBottom ? handleAccept : undefined}
              style={[
                styles.acceptBtn,
                { backgroundColor: scrolledToBottom ? C.acceptBg : C.acceptDisabled },
              ]}
              accessibilityRole="button"
              accessibilityLabel="I Accept"
              accessibilityState={{ disabled: !scrolledToBottom }}
            >
              <RNText style={[styles.acceptBtnText, { color: C.acceptText }]}>I Accept</RNText>
            </Pressable>
            <Pressable
              onPress={handleDecline}
              style={styles.declineBtn}
              accessibilityRole="button"
              accessibilityLabel="Decline"
            >
              <RNText style={[styles.declineBtnText, { color: C.declineText }]}>Decline</RNText>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  backBtn: { position: "absolute", left: 16, padding: 4 },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F6F2EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    color: "#F6F2EB",
    flex: 1,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lastUpdated: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#7A9882",
    marginBottom: 4,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  scrollHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  acceptBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  declineBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtnText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
});
