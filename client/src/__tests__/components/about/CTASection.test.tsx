import { describe, expect, it, vi } from "vitest";

import { CTASection } from "@/components/about/CTASection.tsx";

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <CTASection />
    </MemoryRouter>
  );

describe("CTASection", () => {
  it("제목과 설명, 두 개의 버튼을 렌더링해야 한다", () => {
    renderWithRouter();

    expect(screen.getByText("지금 바로 시작하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "블로그 둘러보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 알아보기" })).toBeInTheDocument();
  });

  it("'블로그 둘러보기' 버튼은 '/'로 연결되어야 한다", () => {
    renderWithRouter();

    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });

  it("'다시 알아보기' 클릭 시 window.scrollTo가 호출되어야 한다", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithRouter();

    fireEvent.click(screen.getByRole("button", { name: "다시 알아보기" }));

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollToSpy.mockRestore();
  });
});
