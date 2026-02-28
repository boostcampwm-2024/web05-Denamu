import axios, { AxiosError } from "axios";

import { BASE_URL } from "@/constants/endpoints";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { refreshAccessToken } from "@/api/services/user.ts";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

// 요청 인터셉터: AT가 있으면 Authorization 추가
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type RetryConfig = {
  _retry?: boolean;
  _skipRefresh?: boolean;
  headers?: any;
  [key: string]: any;
};

// 응답 인터셉터: 401이면 refresh 1회 후 재시도
axiosInstance.interceptors.response.use((res) => res, async (error: AxiosError) => {
  const status = error.response?.status;
  const originalRequest = (error.config ?? {}) as RetryConfig;

  if (status !== 401 || !originalRequest) {
    return Promise.reject(error);
  }

  if (originalRequest._skipRefresh) {
    return Promise.reject(error);
  }

  if (originalRequest._retry) {
    throw error;
  }
  originalRequest._retry = true;

  try {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const res = await refreshAccessToken({ _skipRefresh: true });
        const newAT = res.data?.accessToken ?? null;

        if (newAT) {
          useAuthStore.getState().setUserFromToken(newAT);
        }
        return newAT;
      })().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      useAuthStore.getState().setAccessToken(null);
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance.request(originalRequest);
  } catch (e) {
    useAuthStore.getState().setAccessToken(null);
    return Promise.reject(e);
  }
});