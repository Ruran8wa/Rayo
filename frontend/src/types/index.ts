// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// API
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

// Auth
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

// Accessibility
export type AccessibilityLevel = "fully" | "partial" | "none" | "unknown";

// Service (room/amenity within a floor)
export interface Service {
  id: string;
  name: string;
  icon?: string;
  accessibility_level: AccessibilityLevel;
  features: string[]; // ["Ramp", "Elevator", "Braille", "Signs", "Wide door"]
}

// Floor
export interface Floor {
  id: string;
  name: string;          // "Ground Floor (G)", "1st Floor"
  floor_number: number;
  services: Service[];
}

// Building
export interface Building {
  id: string;
  site_id?: string;      // set when building is part of a Site search result
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;      // "Health", "Government", "Bank", etc.
  accessibility_level: AccessibilityLevel;
  is_open?: boolean;     // not provided by API — omit when unknown
  floor_count: number;
  distance_km?: number;  // set client-side when user location is known
  features: string[];    // top-level features
  floors?: Floor[];      // populated in detail view
}

// Site (a campus/complex containing multiple buildings)
export interface Site {
  id: string;
  name: string;
  address: string;
  category: string;
  building_count: number;
  buildings: Building[];
}

// GeoJSON for map
export interface BuildingFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
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

// Review
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

// Badges
export interface Badge {
  id: string;
  name: string;
  description: string;
  category: "community" | "building" | "photo";
  requirement: string;
  progress?: number;
  required?: number;
  earned: boolean;
  earned_at?: string;
}

// User preferences
export interface UserPreferences {
  disability_type: string;
  preferences: Record<string, string | number | boolean>;
}
