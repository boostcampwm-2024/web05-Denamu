import { create } from "zustand";

type State = {
  postType: "latest" | "recommend" | "subscribe";
};
type Action = {
  setPostType: (postType: State["postType"]) => void;
};

export const usePostTypeStore = create<State & Action>((set) => ({
  postType: "latest",
  setPostType: (postType) => set({ postType }),
}));
