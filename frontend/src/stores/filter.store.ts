import { create } from "zustand";

export const BROWSE_FILTERS = [
  "Near me",
  "Fully accessible",
  "Partial",
  "Open",
  "Government",
  "Health",
  "Bank",
] as const;

export type BrowseFilter = typeof BROWSE_FILTERS[number];

export const MAP_CATEGORIES = [
  "Near me",
  "Health",
  "Government",
  "Bank",
  "Education",
  "Commercial",
] as const;

export type MapCategory = typeof MAP_CATEGORIES[number];

interface FilterState {
  // Browse tab
  browseSearchQuery: string;
  activeBrowseFilters: BrowseFilter[];
  // Map tab
  activeMapCategory: MapCategory | null;
  mapSearchQuery: string;
  setBrowseSearch: (query: string) => void;
  toggleBrowseFilter: (filter: BrowseFilter) => void;
  setMapCategory: (category: MapCategory | null) => void;
  setMapSearch: (query: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  browseSearchQuery: "",
  activeBrowseFilters: ["Near me"],
  activeMapCategory: null,
  mapSearchQuery: "",
  setBrowseSearch: (query) => set({ browseSearchQuery: query }),
  toggleBrowseFilter: (filter) =>
    set((state) => ({
      activeBrowseFilters: state.activeBrowseFilters.includes(filter)
        ? state.activeBrowseFilters.filter((f) => f !== filter)
        : [...state.activeBrowseFilters, filter],
    })),
  setMapCategory: (category) => set({ activeMapCategory: category }),
  setMapSearch: (query) => set({ mapSearchQuery: query }),
}));
