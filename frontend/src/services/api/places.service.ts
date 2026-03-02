import ENV from "@config/env";

export interface PlacePrediction {
  placeId: string;
  name: string;
  address: string;
}

export interface PlaceDetail {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const BASE = "https://maps.googleapis.com/maps/api/place";

export const placesService = {
  async autocomplete(
    input: string,
    lat = -1.9441,
    lng = 30.0619
  ): Promise<PlacePrediction[]> {
    const params = new URLSearchParams({
      input,
      location: `${lat},${lng}`,
      radius: "50000",
      key: ENV.googleMapsApiKey,
    });
    const res = await fetch(`${BASE}/autocomplete/json?${params}`);
    const json = await res.json();
    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") return [];
    return (json.predictions ?? []).map((p: any) => ({
      placeId: p.place_id,
      name: p.structured_formatting?.main_text ?? p.description,
      address: p.structured_formatting?.secondary_text ?? "",
    }));
  },

  async getDetails(placeId: string): Promise<PlaceDetail | null> {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "geometry,name,formatted_address",
      key: ENV.googleMapsApiKey,
    });
    const res = await fetch(`${BASE}/details/json?${params}`);
    const json = await res.json();
    if (json.status !== "OK") return null;
    const r = json.result;
    return {
      placeId,
      name: r.name,
      address: r.formatted_address,
      latitude: r.geometry.location.lat,
      longitude: r.geometry.location.lng,
    };
  },
};
