import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { AdminHeader } from "@/components/admin/layout/AdminHeader.tsx";

import { auth } from "@/api/services/admin/auth.ts";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/api/services/admin/auth.ts", () => ({ auth: { logout: vi.fn() } }));

vi.mock("@/assets/logo-denamu-main.svg", () => ({ default: "logo.svg" }));

vi.mock("@/components/admin/layout/AdminNavigationMenu", () => ({
  AdminNavigationMenu: () => <nav data-testid="admin-nav" />,
}));

vi.mock("@/components/ui/dropdown-menu", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    DropdownMenu: pass,
    DropdownMenuContent: pass,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  };
});

describe("AdminHeader", () => {
  beforeEach(() => vi.clearAllMocks());

  it("관리자 이름과 네비게이션 메뉴를 렌더링해야 한다", () => {
    render(<AdminHeader setLogin={vi.fn()} handleTap={vi.fn()} name="관리자명" />);

    expect(screen.getByText("관리자명")).toBeInTheDocument();
    expect(screen.getByTestId("admin-nav")).toBeInTheDocument();
  });

  it("프로필 클릭 시 handleTap('MYPAGE')을 호출해야 한다", () => {
    const handleTap = vi.fn();
    render(<AdminHeader setLogin={vi.fn()} handleTap={handleTap} name="관리자명" />);

    fireEvent.click(screen.getByText("프로필"));

    expect(handleTap).toHaveBeenCalledWith("MYPAGE");
  });

  it("로그아웃 클릭 시 auth.logout과 setLogin을 호출해야 한다", () => {
    const setLogin = vi.fn();
    render(<AdminHeader setLogin={setLogin} handleTap={vi.fn()} name="관리자명" />);

    fireEvent.click(screen.getByText("로그아웃"));

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(setLogin).toHaveBeenCalledTimes(1);
  });
});
