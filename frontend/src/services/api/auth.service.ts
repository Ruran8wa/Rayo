import type { AuthTokens, User } from "../../types";
import { apiClient } from "./client";

/** The API wraps every response in { "data": <actual> }. Unwrap it. */
function unwrap<T>(responseData: unknown): T {
  const body = responseData as Record<string, unknown>;
  return (body.data ?? body) as T;
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      "/auth/login",
      { email, password }
    );
    return unwrap(response.data);
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
    return unwrap(response.data);
  },
};
