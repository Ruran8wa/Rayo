import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { Nullable, User } from "../types/index";
import { authService } from "../services/api/auth.service";
import { apiClient } from "../services/api/client";
import { storage } from "../utils/storage";

interface AuthContextType {
  user: Nullable<User>;
  token: Nullable<string>;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, disabilityType?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Nullable<User>>(null);
  const [token, setToken] = useState<Nullable<string>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      const storedToken = await storage.get<string>("auth_token");
      const storedUser = await storage.get<User>("user");
      if (storedToken && storedUser) {
        apiClient.setAuthToken(storedToken);
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.error("Auth bootstrap error:", e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { user: u, tokens } = await authService.login(email, password);
    apiClient.setAuthToken(tokens.access_token);
    await storage.set("auth_token", tokens.access_token);
    await storage.set("user", u);
    setToken(tokens.access_token);
    setUser(u);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    disabilityType?: string
  ) => {
    const { user: u, tokens } = await authService.register(name, email, password, disabilityType);
    apiClient.setAuthToken(tokens.access_token);
    await storage.set("auth_token", tokens.access_token);
    await storage.set("user", u);
    setToken(tokens.access_token);
    setUser(u);
  };

  const signOut = async () => {
    apiClient.removeAuthToken();
    await storage.remove("auth_token");
    await storage.remove("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (u: User) => {
    setUser(u);
    storage.set("user", u);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
