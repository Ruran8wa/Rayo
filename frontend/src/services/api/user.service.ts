import type { Building, UserPreferences } from "../../types/index";
import { apiClient } from "./client";

export const userService = {
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<UserPreferences>("/users/preferences");
    return response.data;
  },

  async setPreferences(
    disability_type: string,
    preferences: Record<string, string | number | boolean>
  ): Promise<UserPreferences> {
    const response = await apiClient.post<UserPreferences>("/users/preferences", {
      disability_type,
      preferences,
    });
    return response.data;
  },

  async getSavedPlaces(): Promise<Building[]> {
    const response = await apiClient.get<Building[]>("/users/saved-places");
    return response.data;
  },

  async savePlace(buildingId: string): Promise<void> {
    await apiClient.post("/users/saved-places", { buildingId });
  },

  async removePlace(id: string): Promise<void> {
    await apiClient.delete(`/users/saved-places/${id}`);
  },
};
