import { create } from "zustand";

type MediaType = {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
};

export const useMediaStore = create<MediaType>((set) => ({
  isMobile: false,
  setIsMobile: (value) => {
    set({ isMobile: value });
  },
}));
