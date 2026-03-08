
export const AppConfig = {

  appName: "Rayo",
  appVersion: "1.0.0",

  defaultScreen: "(tabs)",

  features: {
    enableAnalytics: true,
    enableCrashReporting: true,
    enablePushNotifications: true,
  },

  ui: {
    enableHaptics: true,
    defaultAnimationDuration: 300,
  },

  cache: {
    enableCache: true,
    cacheExpiration: 3600000,
  },
} as const;
