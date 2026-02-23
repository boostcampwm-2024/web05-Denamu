import { create } from "zustand";

import { decodeToken } from "@/utils/jwt";
import { refreshAccessToken, logout as logoutApi } from "@/api/services/user";

export type UserInfo = {
  id: number | null;
  email: string | null;
  userName: string | null;
};

type AuthState = {
  accessToken: string | null;
  role: "guest" | "user" | "admin";
  userInfo: UserInfo;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAccessToken: (token: string | null) => void;
  setRole: (role: "guest" | "user" | "admin") => void;
  setUserFromToken: (token: string) => void;
  logout: () => void;
  initialize: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: "guest",
  userInfo: {
    id: null,
    email: null,
    userName: null,
  },
  isAuthenticated: false,
  isInitialized: false,
  setRole: (role) => set({ role }),
  setAccessToken: (token) => set({ accessToken: token }),
  setUserFromToken: (token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      set({
        accessToken: token,
        userInfo: {
          id: decoded.id,
          email: decoded.email,
          userName: decoded.userName,
        },
        role: decoded.role as "user" | "admin",
        isAuthenticated: true,
        isInitialized: true,
      });
    }
  },
  logout: async () => {
    try {
      await logoutApi();
    } catch (e){
      console.warn("logout API 실패: ", e);
    } finally {
      set({
        accessToken: null,
        role: "guest",
        userInfo: {
          id: null,
          email: null,
          userName: null,
        },
        isAuthenticated: false,
      });
    }
  },
  initialize: async () => {
    try {
      const res = await refreshAccessToken();
      const accessToken = res.data?.accessToken;

      if (accessToken) {
        const decoded = decodeToken(accessToken);
        if (!decoded) {
          set({ isInitialized: true });
          return;
        }

        set({
          accessToken,
          userInfo: {
            id: decoded.id,
            email: decoded.email,
            userName: decoded.userName,
          },
          role: decoded.role as "user" | "admin",
          isAuthenticated: true,
          isInitialized: true,
        });
        return;
      }
      set({ isInitialized: true });
    } catch {
      set({
        role: "guest",
        userInfo: {
          id: null,
          email: null,
          userName: null,
        },
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));
