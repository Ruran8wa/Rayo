const ENV = {
  dev: {
    apiUrl: "https://rayo-backend-hzh7.onrender.com/api",
    apiTimeout: 30000,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "",
  },
  prod: {
    apiUrl: "https://rayo-backend-hzh7.onrender.com/api",
    apiTimeout: 30000,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "",
  },
};

const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  return ENV.prod;
};

export default getEnvVars();
