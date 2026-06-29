import { describe, expect, it, vi } from "vitest";

import { AdminNavigationMenu } from "@/components/admin/layout/AdminNavigationMenu.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/ui/navigation-menu", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { NavigationMenu: pass, NavigationMenuList: pass, NavigationMenuItem: pass };
});

describe("AdminNavigationMenu", () => {
  it("네 개의 탭 버튼을 렌더링해야 한다", () => {
    render(<AdminNavigationMenu handleTap={vi.fn()} />);

    expect(screen.getByRole("button", { name: "RSS 목록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원 관리" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "게시글 관리" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "채팅 관리" })).toBeInTheDocument();
  });

  it("각 버튼 클릭 시 해당 탭 타입으로 handleTap을 호출해야 한다", () => {
    const handleTap = vi.fn();
    render(<AdminNavigationMenu handleTap={handleTap} />);

    fireEvent.click(screen.getByRole("button", { name: "RSS 목록" }));
    fireEvent.click(screen.getByRole("button", { name: "회원 관리" }));
    fireEvent.click(screen.getByRole("button", { name: "게시글 관리" }));
    fireEvent.click(screen.getByRole("button", { name: "채팅 관리" }));

    expect(handleTap).toHaveBeenNthCalledWith(1, "RSS");
    expect(handleTap).toHaveBeenNthCalledWith(2, "MEMBER");
    expect(handleTap).toHaveBeenNthCalledWith(3, "POST");
    expect(handleTap).toHaveBeenNthCalledWith(4, "CHAT");
  });
});
