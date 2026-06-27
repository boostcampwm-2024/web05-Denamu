import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

// 전역 setup.tsx 의 LazyImage mock 을 해제하고 실제 구현을 테스트한다.
vi.unmock("@/components/common/LazyImage");

import { LazyImage } from "@/components/common/LazyImage";

describe("LazyImage", () => {
  const originalIO = window.IntersectionObserver;

  beforeEach(() => {
    // 즉시 교차 상태를 만들어 isInView=true 가 되도록 한다.
    window.IntersectionObserver = vi.fn().mockImplementation((cb: IntersectionObserverCallback) => ({
      observe: () => cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as never;
  });

  afterEach(() => {
    window.IntersectionObserver = originalIO;
  });

  it("뷰포트에 들어오면 img가 렌더링되어야 한다", () => {
    render(<LazyImage src="https://img.test/a.png" alt="대체텍스트" />);

    const img = screen.getByRole("img", { name: "대체텍스트" });
    expect(img).toHaveAttribute("src", "https://img.test/a.png");
  });

  it("이미지 로드 전에는 opacity-0, onLoad 후에는 opacity-100이어야 한다", () => {
    render(<LazyImage src="https://img.test/a.png" alt="대체텍스트" />);

    const img = screen.getByRole("img", { name: "대체텍스트" });
    expect(img).toHaveClass("opacity-0");

    fireEvent.load(img);

    expect(img).toHaveClass("opacity-100");
  });
});
