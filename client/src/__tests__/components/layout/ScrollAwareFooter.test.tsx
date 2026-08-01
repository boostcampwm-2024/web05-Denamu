import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import ScrollAwareFooter from "@/components/layout/ScrollAwareFooter.tsx";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("lucide-react", () => lucideProxy());

const mockDirection = vi.fn();
vi.mock("@/hooks/common/useScrollDirection", () => ({
  useScrollDirection: () => mockDirection(),
}));

const renderFooter = () =>
  render(
    <MemoryRouter>
      <ScrollAwareFooter />
    </MemoryRouter>
  );

describe("ScrollAwareFooter", () => {
  it("스크롤 방향이 'up'이면 Footer가 보여야 한다", () => {
    mockDirection.mockReturnValue("up");
    renderFooter();

    const wrapper = screen.getByTestId("scroll-aware-footer");
    expect(wrapper).toHaveClass("translate-y-0");
    expect(wrapper).toHaveAttribute("aria-hidden", "false");
  });

  it("스크롤 방향이 'down'이면 Footer가 숨겨져야 한다", () => {
    mockDirection.mockReturnValue("down");
    renderFooter();

    const wrapper = screen.getByTestId("scroll-aware-footer");
    expect(wrapper).toHaveClass("translate-y-full");
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });
});
