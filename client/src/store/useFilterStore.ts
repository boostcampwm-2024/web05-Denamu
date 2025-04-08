import { create } from "zustand";

import { FILTER } from "@/constants/filter";

type FilterType = {
  filters: string[];
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  addALL: () => void;
  removeAll: () => void;
};

export const useFilterStore = create<FilterType>((set, get) => ({
  filters: [],
  addFilter: (filter) => {
    const { filters } = get();
    set({ filters: [...filters, filter] });
  },
  removeFilter: (filter) => {
    const { filters } = get();
    set({ filters: filters.filter((f) => f !== filter) });
  },
  addALL: () => {
    set({ filters: FILTER });
  },
  removeAll: () => {
    set({ filters: [] });
  },
}));
