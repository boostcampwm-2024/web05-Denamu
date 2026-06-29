// Storybook-only mock adapter on the real service axios instance (axiosInstance),
// letting stories drive success/error UI states. Unmatched requests pass through.
import MockAdapter from "axios-mock-adapter";

import { nav } from "@/utils/redirect";

import { axiosInstance } from "@/api/instance";
import { action } from "storybook/actions";
import { fn } from "storybook/test";

export const mockApi = new MockAdapter(axiosInstance, { onNoMatch: "passthrough" });

const logApiRequest = action("API");
axiosInstance.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const url = config.url ?? "";
  if (method) {
    logApiRequest(`${method} ${url}`);
  }
  return config;
});

export const ok = (data: unknown, message = "성공"): [number, { message: string; data: unknown }] => [
  200,
  { message, data },
];
export const fail = (status = 500, message = "서버 오류가 발생했습니다."): [number, { message: string }] => [
  status,
  { message },
];

const logRedirect = action("REDIRECT");
export const mockRedirect = () => {
  const orig = nav.redirect;
  nav.redirect = fn((url: string) => logRedirect(url));
  return () => {
    nav.redirect = orig;
  };
};
