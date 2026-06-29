import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { HeroSection } from "@/components/about/HeroSection.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("HeroSection", () => {
  it("헤드라인과 이미지, 시작 버튼을 렌더링해야 한다", () => {
    render(<HeroSection />);

    expect(screen.getByText("개발자를 위한 최고의 블로그 허브")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Denamu English Logo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "바로 시작하기" })).toBeInTheDocument();
  });

  it("'바로 시작하기' 클릭 시 #cta-section으로 scrollIntoView를 호출해야 한다", () => {
    const scrollIntoView = vi.fn();
    const cta = document.createElement("div");
    cta.id = "cta-section";
    cta.scrollIntoView = scrollIntoView;
    document.body.appendChild(cta);

    render(<HeroSection />);
    fireEvent.click(screen.getByRole("button", { name: "바로 시작하기" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    cta.remove();
  });
});
