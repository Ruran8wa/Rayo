/**
 * App Configuration
 * General app settings and constants
 */

export const AppConfig = {
  // App Information
  appName: "Rayo",
  appVersion: "1.0.0",

  // Navigation
  defaultScreen: "(tabs)",

  // Features
  features: {
    enableAnalytics: true,
    enableCrashReporting: true,
    enablePushNotifications: true,
  },

  // UI Settings
  ui: {
    enableHaptics: true,
    defaultAnimationDuration: 300,
  },

  // Cache Settings
  cache: {
    enableCache: true,
    cacheExpiration: 3600000, // 1 hour in ms
  },
} as const;
