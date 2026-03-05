import type { AccessibilityLevel, Building, BuildingsGeoJSON, Floor, Service } from "../../types";
import { apiClient } from "./client";

const KIGALI_BOUNDS = { south: -2.0, west: 29.9, north: -1.8, east: 30.2 } as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** The API wraps every response in { "data": <actual> }. Unwrap it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(responseData: unknown): T {
  const body = responseData as Record<string, unknown>;
  return (body.data ?? body) as T;
}

// ─── API → Frontend type transforms ────────────────────────────────────────

function mapAccessibilityClass(cls: string): AccessibilityLevel {
  if (cls === "high") return "fully";
  if (cls === "medium") return "partial";
  if (cls === "low") return "none";
  return "unknown"; // not in database / unexpected value
}

function mapFeatures(b: Record<string, unknown>): string[] {
  const feats: string[] = [];
  if (b.step_free_entrance) feats.push("Step-free entrance");
  if (b.elevator_present) feats.push("Elevator");
  if (b.handrails_present) feats.push("Handrails");
  if (b.ramps_present) feats.push("Ramp");
  return feats;
}

function mapFloorName(level: number): string {
  if (level === -1) return "Basement (B)";
  if (level === 0) return "Ground Floor (G)";
  const ord = ["1st", "2nd", "3rd"][level - 1] ?? `${level}th`;
  return `${ord} Floor`;
}

function mapService(s: Record<string, unknown>): Service {
  return {
    id: s.id as string,
    name: s.name as string,
    accessibility_level: (s.is_accessible ? "fully" : "none") as AccessibilityLevel,
    features: [],
  };
}

function mapFloor(f: Record<string, unknown>): Floor {
  const level = (f.floor_level as number) ?? 0;
  return {
    id: f.id as string,
    name: mapFloorName(level),
    floor_number: level,
    services: ((f.services as Record<string, unknown>[]) ?? []).map(mapService),
  };
}

function mapBuilding(b: Record<string, unknown>): Building {
  const site = (b.site as Record<string, unknown>) ?? {};
  return {
    id: b.id as string,
    name: b.building_name as string,
    address: (site.address as string) ?? "",
    latitude: b.lat as number,
    longitude: b.lng as number,
    category: (site.site_type as string) ?? "",
    accessibility_level: mapAccessibilityClass(b.accessibility_class as string),
    floor_count: (b.total_floors as number) ?? 0,
    features: mapFeatures(b),
    floors: b.floors
      ? (b.floors as Record<string, unknown>[]).map(mapFloor)
      : undefined,
    site_id: site.id as string | undefined,
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export const buildingsService = {
  async getGeoJSON(bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  }): Promise<BuildingsGeoJSON> {
    const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
    const response = await apiClient.get("/buildings/geojson", { bbox });
    // API returns { data: { type, features: [...] } }
    const geojson = unwrap<{ features?: Record<string, unknown>[] }>(response.data);

    return {
      type: "FeatureCollection",
      features: (geojson.features ?? []).map((f) => {
        const props = f.properties as Record<string, unknown>;
        const geom = f.geometry as { type: "Point"; coordinates: [number, number] };
        return {
          type: "Feature" as const,
          geometry: geom,
          properties: {
            id: props.id as string,
            name: (props.building_name ?? props.name) as string,
            accessibility_level: mapAccessibilityClass(
              (props.accessibility_class ?? props.accessibility_level) as string
            ),
            category: (props.site_type ?? props.category) as string,
          },
        };
      }),
    };
  },

  async nearby(lat: number, lng: number): Promise<Building[]> {
    const response = await apiClient.get("/buildings/nearby", { lat, lng });
    const list = unwrap<Record<string, unknown>[]>(response.data);
    return (list ?? []).map(mapBuilding);
  },

  async search(query: string): Promise<Building[]> {
    const response = await apiClient.get("/buildings/search", { q: query });
    // API returns { data: [...buildings] }
    const list = unwrap<Record<string, unknown>[]>(response.data);
    return (list ?? []).map(mapBuilding);
  },

  async getById(id: string): Promise<Building> {
    const response = await apiClient.get(`/buildings/${id}`);
    // API returns { data: { building } }
    const building = unwrap<Record<string, unknown>>(response.data);
    return mapBuilding(building);
  },

  /** Returns all buildings in Kigali via GeoJSON — used for Browse tab initial load */
  async listAll(): Promise<Building[]> {
    const geojson = await buildingsService.getGeoJSON(KIGALI_BOUNDS);
    return geojson.features.map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      address: "",
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      category: f.properties.category,
      accessibility_level: f.properties.accessibility_level,
      floor_count: 0,
      features: [],
    }));
  },
};
