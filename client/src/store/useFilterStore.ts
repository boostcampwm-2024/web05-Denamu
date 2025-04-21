import { create } from "zustand";

type FilterType = {
  filters: string[];
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  removeAll: () => void;
};

export const useFilterStore = create<FilterType>((set, get) => ({
  filters: [],
  addFilter: (filter) => {
    const { filters } = get();
    if (filters.length >= 5) return;
    set({ filters: [...filters, filter] });
  },
  removeFilter: (filter) => {
    const { filters } = get();
    set({ filters: filters.filter((f) => f !== filter) });
  },
  removeAll: () => {
    set({ filters: [] });
  },
}));
