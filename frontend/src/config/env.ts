const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  apiTimeout: 30000,
  mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
};

export default env;
