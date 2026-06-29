import { create } from "zustand";

import { FilterType, SearchMode } from "@/types/search";

interface SearchState {
  currentFilter: FilterType;
  searchMode: SearchMode;
  searchParam: string;
  page: number;
  setFilter: (filter: FilterType) => void;
  setSearchMode: (mode: SearchMode) => void;
  setSearchParam: (param: string) => void;
  setPage: (page: number) => void;
  resetPage: () => void;
  resetParam: () => void;
  resetFilter: () => void;
  resetMode: () => void;
}
interface AdminSearchType {
  searchParam: string;
  setSearchParam: (param: string) => void;
}
export const useSearchStore = create<SearchState>((set) => ({
  currentFilter: "title",
  searchMode: "feed",
  searchParam: "",
  page: 1,
  setFilter: (currentFilter) => set({ currentFilter }),
  setSearchMode: (searchMode) => set({ searchMode }),
  setSearchParam: (param) => set({ searchParam: param }),
  setPage: (page) => set({ page }),
  resetPage: () => set({ page: 1 }),
  resetParam: () => set({ searchParam: "" }),
  resetFilter: () => set({ currentFilter: "title" }),
  resetMode: () => set({ searchMode: "feed" }),
}));

export const useAdminSearchStore = create<AdminSearchType>((set) => ({
  searchParam: "",
  setSearchParam: (param) => set({ searchParam: param }),
}));
