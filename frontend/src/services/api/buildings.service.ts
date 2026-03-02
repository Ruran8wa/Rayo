import type { Building, BuildingsGeoJSON } from "../../types";
import { apiClient } from "./client";

export const buildingsService = {
  async getGeoJSON(bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  }): Promise<BuildingsGeoJSON> {
    const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
    const response = await apiClient.get<BuildingsGeoJSON>("/buildings/geojson", { bbox });
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
