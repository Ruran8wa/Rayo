import type { AccessibilityLevel, Building, Site } from "../../types";
import { apiClient } from "./client";

function unwrap<T>(responseData: unknown): T {
  const body = responseData as Record<string, unknown>;
  return (body.data ?? body) as T;
}

function mapAccessibilityClass(cls: string): AccessibilityLevel {
  if (cls === "high") return "fully";
  if (cls === "medium") return "partial";
  if (cls === "low") return "none";
  return "unknown";
}

function mapBuildingInSite(b: Record<string, unknown>): Building {
  return {
    id: b.id as string,
    name: (b.building_name ?? b.name) as string,
    address: "",
    category: "",
    accessibility_level: mapAccessibilityClass(
      (b.accessibility_class ?? b.accessibility_level) as string
    ),
    floor_count: (b.total_floors as number) ?? 0,
    features: [],
  };
}

function mapSite(s: Record<string, unknown>): Site {
  const buildings = ((s.buildings as Record<string, unknown>[]) ?? []).map(mapBuildingInSite);
  const countFromApi = (s._count as Record<string, number> | undefined)?.buildings;
  return {
    id: s.id as string,
    name: (s.site_name ?? s.name) as string,
    address: (s.address as string) ?? "",
    category: ((s.site_type ?? s.category) as string) ?? "",
    building_count: countFromApi ?? (s.building_count as number) ?? buildings.length,
    buildings,
    lat: s.lat as number | undefined,
    lng: s.lng as number | undefined,
  };
}

export const sitesService = {
  async getAll(): Promise<Site[]> {
    const response = await apiClient.get("/sites");
    const list = unwrap<Record<string, unknown>[]>(response.data);
    return (list ?? []).map(mapSite);
  },

  async getById(id: string): Promise<Site> {
    const response = await apiClient.get(`/sites/${id}`);
    const site = unwrap<Record<string, unknown>>(response.data);
    return mapSite(site);
  },

  async nearby(lat: number, lng: number): Promise<Site[]> {
    const response = await apiClient.get("/buildings/nearby", { lat, lng });
    const list = unwrap<Record<string, unknown>[]>(response.data);
    return (list ?? []).map(mapSite);
  },
};
