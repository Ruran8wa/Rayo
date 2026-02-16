/**
 * Common Type Definitions
 */

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Navigation Types
export type RootStackParamList = {
  "(tabs)": undefined;
  modal: undefined;
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
};

// Theme Types
export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

// User Types (Example)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncState<T> = {
  data: Nullable<T>;
  loading: boolean;
  error: Nullable<ApiError>;
};
