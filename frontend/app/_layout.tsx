import "react-native-gesture-handler";
import "react-native-reanimated";

import {
  DMSerifDisplay_400Regular,
  useFonts as useDMSerif,
} from "@expo-google-fonts/dm-serif-display";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInter,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/contexts";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [dmSerifLoaded] = useDMSerif({ DMSerifDisplay_400Regular });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsLoaded = dmSerifLoaded && interLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="building/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="review/new"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="light" />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
