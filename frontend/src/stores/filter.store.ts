import { create } from "zustand";

export const BROWSE_FILTERS = [
  "Near me",
  "Health",
  "Government",
  "Bank",
  "Education",
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

export interface FilterState {

  browseSearchQuery: string;
  activeBrowseFilters: BrowseFilter[];

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
    set((state) => {
      const cur = state.activeBrowseFilters;

      if (filter === "Near me") {

        return { activeBrowseFilters: ["Near me"] };
      }

      if (cur.includes(filter)) {

        const next = cur.filter((f) => f !== filter);
        return { activeBrowseFilters: next.length === 0 ? ["Near me"] : next };
      } else {

        return { activeBrowseFilters: [...cur.filter((f) => f !== "Near me"), filter] };
      }
    }),
  setMapCategory: (category) => set({ activeMapCategory: category }),
  setMapSearch: (query) => set({ mapSearchQuery: query }),
}));
