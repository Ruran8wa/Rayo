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

  async search(query: string): Promise<Building[]> {
    const response = await apiClient.get<Building[]>("/buildings/search", { q: query });
    return response.data;
  },

  async getById(id: string): Promise<Building> {
    const response = await apiClient.get<Building>(`/buildings/${id}`);
    return response.data;
  },
};
