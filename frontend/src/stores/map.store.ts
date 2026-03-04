import { create } from "zustand";
import type { Building, Site } from "@/types";

export type MapRegion = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export interface MapState {
  selectedBuildingId: string | null;
  previewBuilding: Building | null;
  previewSite: Site | null;
  mapRegion: MapRegion;
  setSelectedBuilding: (building: Building | null) => void;
  setPreviewSite: (site: Site | null) => void;
  setMapRegion: (region: MapRegion) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedBuildingId: null,
  previewBuilding: null,
  previewSite: null,
  mapRegion: {
    latitude: -1.9441,
    longitude: 30.0619,
    zoom: 13,
  },
  setSelectedBuilding: (building) =>
    set({
      selectedBuildingId: building?.id ?? null,
      previewBuilding: building,
      previewSite: null,       // mutually exclusive
    }),
  setPreviewSite: (site) =>
    set({
      previewSite: site,
      previewBuilding: null,   // mutually exclusive
      selectedBuildingId: null,
    }),
  setMapRegion: (region) => set({ mapRegion: region }),
  clearSelection: () =>
    set({ selectedBuildingId: null, previewBuilding: null, previewSite: null }),
}));
