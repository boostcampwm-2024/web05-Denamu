import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { FeatureSection } from "@/components/about/FeatureSection.tsx";

import { FEATURES } from "@/constants/about.ts";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("FeatureSection", () => {
  it("FEATURES 그룹의 mainTitle/groupTitle이 모두 렌더링되어야 한다", () => {
    const { container } = render(<FeatureSection />);

    FEATURES.forEach((group) => {
      expect(screen.getByText(group.mainTitle)).toBeInTheDocument();
      expect(container).toHaveTextContent(group.groupTitle.replace(/\s+/g, " "));
    });
  });

  it("각 그룹의 feature longTitle이 렌더링되어야 한다", () => {
    render(<FeatureSection />);

    FEATURES.flatMap((group) => group.features).forEach((feature) => {
      expect(screen.getByText(feature.longTitle)).toBeInTheDocument();
    });
  });
});
