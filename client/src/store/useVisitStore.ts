import { create } from "zustand";

import { persist, createJSONStorage } from "zustand/middleware";

interface VisitState {
  hasVisited: boolean;
  setVisited: () => void;
}

export const useVisitStore = create<VisitState>()(
  persist(
    (set) => ({
      hasVisited: false,
      setVisited: () => set({ hasVisited: true }),
    }),
    {
      name: "visit-flag",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
