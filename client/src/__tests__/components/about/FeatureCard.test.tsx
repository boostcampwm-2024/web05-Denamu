import { describe, expect, it } from "vitest";

import { FeatureCard } from "@/components/about/FeatureCard.tsx";

import { FeatureItem } from "@/types/about.ts";
import { render, screen } from "@testing-library/react";

const baseFeature: FeatureItem = {
  shortTitle: "짧은 제목",
  longTitle: "긴 제목",
  description: "설명 텍스트",
  icon: () => <span data-testid="feature-icon" />,
};

describe("FeatureCard", () => {
  it("shortTitle, longTitle, description, icon이 렌더링되어야 한다", () => {
    render(<FeatureCard feature={baseFeature} />);

    expect(screen.getByText("짧은 제목")).toBeInTheDocument();
    expect(screen.getByText("긴 제목")).toBeInTheDocument();
    expect(screen.getByText("설명 텍스트")).toBeInTheDocument();
    expect(screen.getByTestId("feature-icon")).toBeInTheDocument();
  });

  it("imageSrc가 있으면 이미지를 렌더링해야 한다", () => {
    render(<FeatureCard feature={{ ...baseFeature, imageSrc: "https://img.test/a.png", imageAlt: "대체텍스트" }} />);

    const img = screen.getByRole("img", { name: "대체텍스트" });
    expect(img).toHaveAttribute("src", "https://img.test/a.png");
  });

  it("imageSrc가 없으면 '이미지 준비 중' placeholder를 렌더링해야 한다", () => {
    render(<FeatureCard feature={baseFeature} />);

    expect(screen.getByText("이미지 준비 중")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("초기에는 isInView=false라 opacity-0 클래스가 적용되어야 한다", () => {
    const { container } = render(<FeatureCard feature={baseFeature} />);

    expect(container.firstChild).toHaveClass("opacity-0", "translate-y-10");
  });
});
