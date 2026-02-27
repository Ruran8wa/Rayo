import type { AuthTokens, User } from "../../types";
import { apiClient } from "./client";

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      "/auth/login",
      { email, password }
    );
    return response.data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    disability_type?: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      "/auth/register",
      { name, email, password, disability_type }
    );
    return response.data;
  },
};
