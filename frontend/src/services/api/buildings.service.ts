import type { AccessibilityLevel, Building, BuildingsGeoJSON, Floor, Service } from "../../types";
import { apiClient } from "./client";

const KIGALI_BOUNDS = { south: -2.0, west: 29.9, north: -1.8, east: 30.2 } as const;

// ─── API → Frontend type transforms ────────────────────────────────────────

function mapAccessibilityClass(cls: string): AccessibilityLevel {
  if (cls === "high") return "fully";
  if (cls === "medium") return "partial";
  return "none";
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
    const response = await apiClient.get<{ features: Record<string, unknown>[] }>(
      "/buildings/geojson",
      { bbox }
    );
    const raw = response.data as unknown as { features?: Record<string, unknown>[] };
    // Normalise API property names to match our BuildingFeature type
    return {
      type: "FeatureCollection",
      features: (raw.features ?? []).map((f) => {
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

  async search(query: string): Promise<Building[]> {
    const response = await apiClient.get<Record<string, unknown>[]>(
      "/buildings/search",
      { q: query }
    );
    return ((response.data as unknown as Record<string, unknown>[]) ?? []).map(mapBuilding);
  },

  async getById(id: string): Promise<Building> {
    const response = await apiClient.get<Record<string, unknown>>(`/buildings/${id}`);
    return mapBuilding(response.data as unknown as Record<string, unknown>);
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
