
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  disability_type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export type AccessibilityLevel = "fully" | "partial" | "none" | "unknown";

export interface Service {
  id: string;
  name: string;
  icon?: string;
  accessibility_level: AccessibilityLevel;
  features: string[];
}

export interface Floor {
  id: string;
  name: string;
  floor_number: number;
  services: Service[];
  mobility_accessible: boolean;
  clear_signage: boolean;
  high_contrast_signage: boolean;
}

export interface Building {
  id: string;
  site_id?: string;
  site_name?: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category: string;
  accessibility_level: AccessibilityLevel;
  is_open?: boolean;
  floor_count: number;
  distance_km?: number;
  features: string[];
  floors?: Floor[];
}

export interface Site {
  id: string;
  name: string;
  address: string;
  category: string;
  building_count: number;
  buildings: Building[];
  lat?: number;
  lng?: number;
}

export interface BuildingFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    accessibility_level: AccessibilityLevel;
    category: string;
  };
}

export interface BuildingsGeoJSON {
  type: "FeatureCollection";
  features: BuildingFeature[];
}

export interface Review {
  id: string;
  user_id: string;
  building_id: string;
  building_name: string;
  scope: "building" | "floor" | "service";
  scope_name?: string;
  accessibility_level: AccessibilityLevel;
  comment: string;
  helpful_votes: number;
  photos: string[];
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'community' | 'explorer' | 'impact';
  requirement: string;
  required: number;
  progress: number;
  earned: boolean;
  earned_at?: string;
}

export interface UserPreferences {
  disability_type?: string;
  preferences: Record<string, string | number | boolean>;
}
