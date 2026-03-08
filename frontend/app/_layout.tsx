import "react-native-gesture-handler";
import "react-native-reanimated";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, TextSizeProvider } from "@/contexts";

SplashScreen.hideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <TextSizeProvider>
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
              name="site/[id]"
              options={{ headerShown: false }}
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
        </TextSizeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
