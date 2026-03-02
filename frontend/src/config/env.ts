const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  apiTimeout: 30000,
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
};

export default env;
