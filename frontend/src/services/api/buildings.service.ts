import type { Building, BuildingsGeoJSON } from "../../types";
import { apiClient } from "./client";

export const buildingsService = {
  async getGeoJSON(bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  }): Promise<BuildingsGeoJSON> {
    const response = await apiClient.get<BuildingsGeoJSON>("/buildings/geojson", {
      south: bounds.south,
      west: bounds.west,
      north: bounds.north,
      east: bounds.east,
    });
    return response.data;
  },

  async search(query: string, filters?: string[]): Promise<Building[]> {
    const params: Record<string, unknown> = { q: query };
    if (filters && filters.length > 0) {
      params.filters = filters.join(",");
    }
    const response = await apiClient.get<Building[]>("/buildings/search", params);
    return response.data;
  },

  async getById(id: string): Promise<Building> {
    const response = await apiClient.get<Building>(`/buildings/${id}`);
    return response.data;
  },
};
