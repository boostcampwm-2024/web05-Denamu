import { create } from "zustand";

import { decodeToken } from "@/utils/jwt";
import { refreshAccessToken, logout as logoutApi } from "@/api/services/user";

const AUTH_HINT_KEY = "denamu_auth_hint";

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
  setUserName: (userName: string) => void;
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
  setUserName: (userName) => set((state) => ({ userInfo: { ...state.userInfo, userName } })),
  setUserFromToken: (token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      localStorage.setItem(AUTH_HINT_KEY, "1");
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
      localStorage.removeItem(AUTH_HINT_KEY);
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
    const isOAuthCallback = window.location.pathname === "/oauth-success";
    const hasAuthHint = localStorage.getItem(AUTH_HINT_KEY) === "1";
    if (!hasAuthHint && !isOAuthCallback) {
      set({ isInitialized: true });
      return;
    }

    try {
      const res = await refreshAccessToken();
      const accessToken = res.data?.accessToken;

      if (accessToken) {
        const decoded = decodeToken(accessToken);
        if (!decoded) {
          localStorage.removeItem(AUTH_HINT_KEY);
          set({ isInitialized: true });
          return;
        }

        localStorage.setItem(AUTH_HINT_KEY, "1");
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
      localStorage.removeItem(AUTH_HINT_KEY);
      set({ isInitialized: true });
    } catch {
      localStorage.removeItem(AUTH_HINT_KEY);
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
