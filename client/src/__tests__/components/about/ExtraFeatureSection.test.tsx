import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { ExtraFeatureSection } from "@/components/about/ExtraFeatureSection.tsx";

import { EXTRA_FEATURES } from "@/constants/about.ts";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("ExtraFeatureSection", () => {
  it("mainTitle과 groupTitle이 렌더링되어야 한다", () => {
    const { container } = render(<ExtraFeatureSection />);

    expect(screen.getByText(EXTRA_FEATURES.mainTitle)).toBeInTheDocument();
    expect(container).toHaveTextContent(EXTRA_FEATURES.groupTitle.replace(/\s+/g, " "));
  });

  it("각 섹션 제목과 feature shortTitle이 렌더링되어야 한다", () => {
    render(<ExtraFeatureSection />);

    EXTRA_FEATURES.sections.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      section.features.forEach((feature) => {
        expect(screen.getByText(feature.shortTitle)).toBeInTheDocument();
      });
    });
  });

  it("feature의 모든 item이 리스트로 렌더링되어야 한다", () => {
    render(<ExtraFeatureSection />);

    const items = EXTRA_FEATURES.sections.flatMap((s) => s.features).flatMap((f) => f.items);
    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
});
