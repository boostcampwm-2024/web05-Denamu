import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { Sidebar } from "@/components/profile/sidebar/Sidebar.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/components/profile/sidebar/Item.tsx", () => ({
  Item: ({ label }: { label: string }) => <button>{label}</button>,
}));

describe("Profile Sidebar", () => {
  it("네 개의 메뉴 항목과 로그아웃, 로고를 렌더링해야 한다", () => {
    render(<Sidebar />);

    expect(screen.getByText("프로필")).toBeInTheDocument();
    expect(screen.getByText("최근 작성한 글")).toBeInTheDocument();
    expect(screen.getByText("좋아요한 목록")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Denamu" })).toBeInTheDocument();
  });
});
