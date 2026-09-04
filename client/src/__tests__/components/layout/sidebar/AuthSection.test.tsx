import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { mockAvatar } from "@/__tests__/__mocks__/components/ui/Avatar.tsx";
import { AuthSection } from "@/components/layout/sidebar/AuthSection.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const logout = vi.fn();
let authState: {
  isAuthenticated: boolean;
  userInfo: { id: number; userName: string; email: string };
  logout: typeof logout;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/hooks/queries/useProfile", () => ({
  useUserProfile: () => ({ data: { profileImage: null } }),
}));

vi.mock("@/components/ui/avatar", () => mockAvatar);

describe("AuthSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = {
      isAuthenticated: false,
      userInfo: { id: 1, userName: "민석", email: "min@test.com" },
      logout,
    };
  });

  it("비인증 상태에서는 로그인 버튼만 보이고 클릭 시 /signin으로 이동해야 한다", () => {
    const onAction = vi.fn();
    render(<AuthSection onAction={onAction} />);

    const loginBtn = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(loginBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("인증 상태에서는 유저 이름/이메일과 프로필 카드를 렌더링하고 별도 프로필·로그아웃 버튼은 없어야 한다", () => {
    authState.isAuthenticated = true;
    render(<AuthSection onAction={vi.fn()} />);

    expect(screen.getAllByText("민석").length).toBeGreaterThan(0);
    expect(screen.getByText("min@test.com")).toBeInTheDocument();
    expect(screen.getAllByTestId("avatar-fallback").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "프로필" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /로그아웃/ })).not.toBeInTheDocument();
  });

  it("프로필 카드 클릭 시 /profile로 이동하고 onAction을 호출해야 한다", () => {
    authState.isAuthenticated = true;
    const onAction = vi.fn();
    render(<AuthSection onAction={onAction} />);

    fireEvent.click(screen.getByText("min@test.com"));

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
