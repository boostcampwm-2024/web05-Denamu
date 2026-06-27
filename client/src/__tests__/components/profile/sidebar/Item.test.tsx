import { beforeEach, describe, expect, it, vi } from "vitest";

import { Item } from "@/components/profile/sidebar/Item.tsx";

import { LucideIcon } from "lucide-react";
import { fireEvent, render, screen } from "@testing-library/react";

const Icon = (() => <svg data-testid="item-icon" />) as unknown as LucideIcon;

describe("Profile Sidebar Item", () => {
  beforeEach(() => vi.clearAllMocks());

  it("아이콘과 라벨을 렌더링해야 한다", () => {
    render(<Item icon={Icon} label="프로필" id="profile" />);

    expect(screen.getByTestId("item-icon")).toBeInTheDocument();
    expect(screen.getByText("프로필")).toBeInTheDocument();
  });

  it("id가 'profile'이면 클릭 시 window.scrollTo를 호출해야 한다", () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Item icon={Icon} label="프로필" id="profile" />);

    fireEvent.click(screen.getByRole("button"));

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollSpy.mockRestore();
  });

  it("id가 'profile'이 아니면 해당 섹션으로 scrollIntoView를 호출해야 한다", () => {
    const target = document.createElement("div");
    target.id = "liked";
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    render(<Item icon={Icon} label="좋아요" id="liked" />);
    fireEvent.click(screen.getByRole("button"));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    target.remove();
  });
});
