import { create } from "zustand";
import type { Building } from "@/types";

export type MapRegion = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export interface MapState {
  selectedBuildingId: string | null;
  previewBuilding: Building | null;
  mapRegion: MapRegion;
  setSelectedBuilding: (building: Building | null) => void;
  setMapRegion: (region: MapRegion) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedBuildingId: null,
  previewBuilding: null,
  mapRegion: {
    latitude: -1.9441, // Kigali, Rwanda (default)
    longitude: 30.0619,
    zoom: 13,
  },
  setSelectedBuilding: (building) =>
    set({
      selectedBuildingId: building?.id ?? null,
      previewBuilding: building,
    }),
  setMapRegion: (region) => set({ mapRegion: region }),
  clearSelection: () => set({ selectedBuildingId: null, previewBuilding: null }),
}));
