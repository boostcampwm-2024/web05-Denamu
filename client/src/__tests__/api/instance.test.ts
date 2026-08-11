import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MockAdapter from "axios-mock-adapter";

import { axiosInstance } from "@/api/instance";
import { useAuthStore } from "@/store/useAuthStore";
import { USER } from "@/constants/endpoints";
import { nav } from "@/utils/redirect";

vi.mock("@/utils/redirect.ts", () => ({
  nav: { redirect: vi.fn() },
}));

const AUTH_HINT_KEY = "denamu_auth_hint";
const PROTECTED_URL = "/api/protected-test";

const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString("base64url");

const makeJwt = (payload: Record<string, unknown>) =>
  `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;

const setAuthenticatedState = () => {
  useAuthStore.setState({
    accessToken: "old-access-token",
    role: "user",
    userInfo: { id: 1, email: "tester@denamu.dev", userName: "tester" },
    isAuthenticated: true,
    isInitialized: true,
  });
  localStorage.setItem(AUTH_HINT_KEY, "1");
};

const setGuestState = () => {
  useAuthStore.setState({
    accessToken: null,
    role: "guest",
    userInfo: { id: null, email: null, userName: null },
    isAuthenticated: false,
    isInitialized: true,
  });
};

let mock: MockAdapter;

describe("axiosInstance 응답 인터셉터 - refresh token 만료 처리", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    vi.mocked(nav.redirect).mockClear();
    setGuestState();
  });

  afterEach(() => {
    mock.restore();
    localStorage.clear();
  });

  it("로그인 상태에서 AT가 만료되고 refresh마저 실패하면 세션을 완전히 초기화하고 /signin으로 유도한다", async () => {
    setAuthenticatedState();
    mock.onGet(PROTECTED_URL).reply(401);
    mock.onPost(USER.REFRESH_TOKEN).reply(401);

    await expect(axiosInstance.get(PROTECTED_URL)).rejects.toBeTruthy();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.role).toBe("guest");
    expect(state.userInfo).toEqual({ id: null, email: null, userName: null });
    expect(localStorage.getItem(AUTH_HINT_KEY)).toBeNull();
    expect(nav.redirect).toHaveBeenCalledWith("/signin");
  });

  it("refresh가 성공하면 원래 요청을 새 토큰으로 재시도하고 로그인 상태를 유지한다", async () => {
    setAuthenticatedState();
    const newAccessToken = makeJwt({
      id: 1,
      email: "tester@denamu.dev",
      userName: "tester",
      role: "user",
      iat: 1,
      exp: 9999999999,
    });
    mock.onGet(PROTECTED_URL).replyOnce(401).onGet(PROTECTED_URL).reply(200, { data: "ok" });
    mock.onPost(USER.REFRESH_TOKEN).reply(200, { message: "재발급 성공", data: { accessToken: newAccessToken } });

    const response = await axiosInstance.get(PROTECTED_URL);

    expect(response.data).toEqual({ data: "ok" });
    expect(mock.history.get[1].headers?.Authorization).toBe(`Bearer ${newAccessToken}`);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe(newAccessToken);
    expect(nav.redirect).not.toHaveBeenCalled();
  });

  it("비로그인(guest) 상태에서 401을 받으면 refresh 실패해도 /signin으로 리다이렉트하지 않는다", async () => {
    mock.onGet(PROTECTED_URL).reply(401);
    mock.onPost(USER.REFRESH_TOKEN).reply(401);

    await expect(axiosInstance.get(PROTECTED_URL)).rejects.toBeTruthy();

    expect(nav.redirect).not.toHaveBeenCalled();
  });
});
