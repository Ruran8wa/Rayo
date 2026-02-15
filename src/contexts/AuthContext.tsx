/**
 * Authentication Context
 * Manages user authentication state and operations
 */

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import type { Nullable, User } from "../types/index";
import { storage } from "../utils/storage";

interface AuthContextType {
  user: Nullable<User>;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Nullable<User>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await storage.get<User>("user");
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Implement actual API call
      // const response = await authService.signIn(email, password);
      // const userData = response.data;

      // Mock user for now
      const userData: User = {
        id: "1",
        email,
        name: "User Name",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storage.set("user", userData);
      setUser(userData);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // TODO: Implement actual API call
      // const response = await authService.signUp(email, password, name);
      // const userData = response.data;

      // Mock user for now
      const userData: User = {
        id: "1",
        email,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storage.set("user", userData);
      setUser(userData);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await storage.remove("user");
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storage.set("user", updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
