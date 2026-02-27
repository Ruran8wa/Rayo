import type { Site } from "../../types";
import { apiClient } from "./client";

export const sitesService = {
  async getAll(): Promise<Site[]> {
    const response = await apiClient.get<Site[]>("/sites");
    return response.data;
  },

  async getById(id: string): Promise<Site> {
    const response = await apiClient.get<Site>(`/sites/${id}`);
    return response.data;
  },
};
