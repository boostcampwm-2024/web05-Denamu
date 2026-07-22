import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { UserProfileMenu } from "@/components/common/UserProfileMenu.tsx";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const logout = vi.fn();
let authState: { isAuthenticated: boolean; userInfo: { userName: string; email: string }; logout: typeof logout };

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

vi.mock("@/components/ui/dropdown-menu", () => {
  const passthrough = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    DropdownMenu: passthrough,
    DropdownMenuTrigger: passthrough,
    DropdownMenuContent: passthrough,
    DropdownMenuLabel: passthrough,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  };
});

describe("UserProfileMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { isAuthenticated: false, userInfo: { userName: "민석", email: "min@test.com" }, logout };
  });

  it("비인증 상태에서는 로그인 버튼만 보이고 클릭 시 /signin으로 이동해야 한다", () => {
    render(<UserProfileMenu />);

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("인증 상태에서는 유저 이름/이메일을 표시해야 한다", () => {
    authState.isAuthenticated = true;
    render(<UserProfileMenu />);

    expect(screen.getAllByText("민석").length).toBeGreaterThan(0);
    expect(screen.getByText("min@test.com")).toBeInTheDocument();
  });

  it("프로필 클릭 시 /profile로 이동해야 한다", () => {
    authState.isAuthenticated = true;
    render(<UserProfileMenu />);

    fireEvent.click(screen.getByText("프로필"));

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("로그아웃 클릭 시 logout 후 페이지를 새로고침해야 한다", async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });
    authState.isAuthenticated = true;
    render(<UserProfileMenu />);

    fireEvent.click(screen.getByText("로그아웃"));

    expect(logout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(reloadMock).toHaveBeenCalledTimes(1));
  });
});
