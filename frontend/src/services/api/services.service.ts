import type { Service } from "../../types/index";
import { apiClient } from "./client";

export const servicesService = {
  async search(
    query: string,
    options?: { lat?: number; lng?: number; radius?: number }
  ): Promise<Service[]> {
    const params: Record<string, unknown> = { q: query };
    if (options?.lat !== undefined) params.lat = options.lat;
    if (options?.lng !== undefined) params.lng = options.lng;
    if (options?.radius !== undefined) params.radius = options.radius;
    const response = await apiClient.get<Service[]>("/services/search", params);
    return response.data;
  },
};
