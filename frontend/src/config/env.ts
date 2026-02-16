/**
 * Environment Configuration
 * Centralized environment variables and configuration
 */

import Constants from "expo-constants";

const ENV = {
  dev: {
    apiUrl: "http://localhost:3000/api",
    apiTimeout: 30000,
  },
  staging: {
    apiUrl: "https://staging-api.example.com/api",
    apiTimeout: 30000,
  },
  prod: {
    apiUrl: "https://api.example.com/api",
    apiTimeout: 30000,
  },
};

const getEnvVars = () => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (__DEV__) {
    return ENV.dev;
  } else if (releaseChannel === "staging") {
    return ENV.staging;
  } else {
    return ENV.prod;
  }
};

export default getEnvVars();
