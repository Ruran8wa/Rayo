import { apiClient } from "./client";

export interface CreateReviewPayload {
  building_id?: string;
  place_name?: string;
  place_address?: string;
  scope: "building" | "floor" | "service";
  accessibility_level: "fully" | "partial" | "none";
  comment?: string;
}

export interface ReviewRecord {
  id: string;
  user_id: string;
  building_id: string | null;
  place_name: string | null;
  place_address: string | null;
  scope: string;
  accessibility_level: string;
  comment: string | null;
  created_at: string;
}

function unwrap<T>(responseData: unknown): T {
  const body = responseData as Record<string, unknown>;
  return (body.data ?? body) as T;
}

export const reviewsService = {
  async create(payload: CreateReviewPayload): Promise<ReviewRecord> {
    const response = await apiClient.post("/reviews", payload);
    return unwrap<ReviewRecord>(response.data);
  },

  async getByBuilding(buildingId: string): Promise<ReviewRecord[]> {
    const response = await apiClient.get(`/reviews/building/${buildingId}`);
    const list = unwrap<ReviewRecord[]>(response.data);
    return list ?? [];
  },
};
