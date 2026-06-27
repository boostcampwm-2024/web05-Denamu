import { describe, expect, it } from "vitest";

import { Legend } from "@/components/profile/header/ui/ActivityGraph/Legend.tsx";

import { render, screen } from "@testing-library/react";

describe("ActivityGraph Legend", () => {
  it("Less/More 라벨과 5단계 색상 칸을 렌더링해야 한다", () => {
    const { container } = render(<Legend />);

    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
    expect(container.querySelectorAll("div.rounded-sm")).toHaveLength(5);
  });
});
