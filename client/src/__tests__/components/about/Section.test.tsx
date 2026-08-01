import { describe, expect, it } from "vitest";

import { Section } from "@/components/about/Section.tsx";

import { render, screen } from "@testing-library/react";

describe("Section", () => {
  it("children을 렌더링해야 한다", () => {
    render(
      <Section>
        <p>섹션 내용</p>
      </Section>
    );

    expect(screen.getByText("섹션 내용")).toBeInTheDocument();
  });

  it("전달한 className과 HTML 속성이 section 요소에 병합되어야 한다", () => {
    const { container } = render(
      <Section className="custom-class" id="my-section">
        <span>x</span>
      </Section>
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-class");
    expect(section).toHaveClass("transition-all");
    expect(section).toHaveAttribute("id", "my-section");
  });

  it("초기에는 isInView=false라 opacity-0 클래스가 적용되어야 한다", () => {
    const { container } = render(
      <Section>
        <span>x</span>
      </Section>
    );

    expect(container.querySelector("section")).toHaveClass("opacity-0", "translate-y-10");
  });
});
