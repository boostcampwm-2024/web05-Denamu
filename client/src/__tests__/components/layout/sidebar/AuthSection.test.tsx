import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { AuthSection } from "@/components/layout/sidebar/AuthSection.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const logout = vi.fn();
let authState: {
  isAuthenticated: boolean;
  userInfo: { userName: string; email: string };
  logout: typeof logout;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: mockToast }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

describe("AuthSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = {
      isAuthenticated: false,
      userInfo: { userName: "민석", email: "min@test.com" },
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

  it("인증 상태에서는 유저 이름/이메일과 프로필·로그아웃 버튼을 렌더링해야 한다", () => {
    authState.isAuthenticated = true;
    render(<AuthSection onAction={vi.fn()} />);

    expect(screen.getByText("민석")).toBeInTheDocument();
    expect(screen.getByText("min@test.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /프로필/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /로그아웃/ })).toBeInTheDocument();
  });

  it("프로필 클릭 시 toast를 띄우고 onAction을 호출해야 한다", () => {
    authState.isAuthenticated = true;
    const onAction = vi.fn();
    render(<AuthSection onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: /프로필/ }));

    expect(mockToast).toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("로그아웃 클릭 시 logout과 toast, onAction을 호출해야 한다", () => {
    authState.isAuthenticated = true;
    const onAction = vi.fn();
    render(<AuthSection onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: /로그아웃/ }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "로그아웃 성공" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
