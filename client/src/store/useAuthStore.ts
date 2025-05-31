import { create } from "zustand";

import { decodeToken, getStoredToken, removeStoredToken } from "@/utils/jwt";

export type UserInfo = {
  id: number | null;
  email: string | null;
  userName: string | null;
};

type AuthState = {
  role: "guest" | "user" | "admin";
  userInfo: UserInfo;
  isAuthenticated: boolean;
  setRole: (role: "guest" | "user" | "admin") => void;
  setUserFromToken: (token: string) => void;
  logout: () => void;
  initialize: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: "guest",
  userInfo: {
    id: null,
    email: null,
    userName: null,
  },
  isAuthenticated: false,
  setRole: (role) => set({ role }),
  setUserFromToken: (token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      set({
        userInfo: {
          id: decoded.id,
          email: decoded.email,
          userName: decoded.userName,
        },
        role: decoded.role as "user" | "admin",
        isAuthenticated: true,
      });
    }
  },
  logout: () => {
    removeStoredToken();
    set({
      role: "guest",
      userInfo: {
        id: null,
        email: null,
        userName: null,
      },
      isAuthenticated: false,
    });
  },
  initialize: () => {
    const token = getStoredToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        set({
          userInfo: {
            id: decoded.id,
            email: decoded.email,
            userName: decoded.userName,
          },
          role: decoded.role as "user" | "admin",
          isAuthenticated: true,
        });
      } else {
        removeStoredToken();
      }
    }
  },
}));
