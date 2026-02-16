/**
 * API Service Example
 * Example service for user-related API calls
 */

import type { User } from "../../types/index";
import { apiClient } from "./client";

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/user/profile");
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>("/user/profile", data);
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/user/${id}`);
    return response.data;
  },
};
