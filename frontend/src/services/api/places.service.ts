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

export interface NearbyPlace {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating?: number;
  totalRatings?: number;
}

const BASE = "https://maps.googleapis.com/maps/api/place";

const TYPE_TO_CATEGORY: Record<string, string> = {
  hospital: "Health",
  pharmacy: "Health",
  doctor: "Health",
  clinic: "Health",
  school: "Education",
  university: "Education",
  bank: "Bank",
  atm: "Bank",
  local_government_office: "Government",
  city_hall: "Government",
  post_office: "Government",
  police: "Government",
};

const CATEGORY_TYPES: Record<string, string[]> = {
  Health:     ["hospital", "pharmacy"],
  Government: ["local_government_office", "city_hall"],
  Bank:       ["bank", "atm"],
  Education:  ["school", "university"],
};

const DEFAULT_TYPES = [
  "hospital", "pharmacy",
  "school", "university",
  "bank", "atm",
  "local_government_office", "city_hall", "post_office", "police",
];

function mapGoogleTypes(types: string[]): string {
  for (const t of types) {
    if (TYPE_TO_CATEGORY[t]) return TYPE_TO_CATEGORY[t];
  }
  return "Other";
}

async function searchByType(lat: number, lng: number, type: string): Promise<NearbyPlace[]> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: "5000",
    type,
    key: ENV.googleMapsApiKey,
  });
  try {
    const res = await fetch(`${BASE}/nearbysearch/json?${params}`);
    const json = await res.json();
    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") return [];
    return (json.results ?? []).slice(0, 8).map((p: Record<string, unknown>) => {
      const geometry = p.geometry as { location: { lat: number; lng: number } };
      return {
        placeId: p.place_id as string,
        name: p.name as string,
        address: (p.vicinity as string) ?? "",
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
        category: mapGoogleTypes((p.types as string[]) ?? []),
        rating: p.rating as number | undefined,
        totalRatings: p.user_ratings_total as number | undefined,
      };
    });
  } catch {
    return [];
  }
}

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
    return (json.predictions ?? []).map((p: Record<string, unknown>) => {
      const sf = p.structured_formatting as Record<string, string> | undefined;
      return {
        placeId: p.place_id as string,
        name: sf?.main_text ?? (p.description as string),
        address: sf?.secondary_text ?? "",
      };
    });
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
    const r = json.result as Record<string, unknown>;
    const geom = r.geometry as { location: { lat: number; lng: number } };
    return {
      placeId,
      name: r.name as string,
      address: r.formatted_address as string,
      latitude: geom.location.lat,
      longitude: geom.location.lng,
    };
  },

  async nearbySearch(
    lat: number,
    lng: number,
    categories?: string[]
  ): Promise<NearbyPlace[]> {
    const types =
      categories && categories.length > 0
        ? [...new Set(categories.flatMap((c) => CATEGORY_TYPES[c] ?? []))]
        : DEFAULT_TYPES;

    const arrays = await Promise.all(types.map((t) => searchByType(lat, lng, t)));
    const seen = new Set<string>();
    const results: NearbyPlace[] = [];
    for (const list of arrays) {
      for (const place of list) {
        if (!seen.has(place.placeId)) {
          seen.add(place.placeId);
          results.push(place);
        }
      }
    }
    return results;
  },
};
