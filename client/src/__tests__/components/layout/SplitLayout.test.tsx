import { describe, expect, it } from "vitest";

import SplitLayout from "@/components/layout/SplitLayout.tsx";

import { render, screen } from "@testing-library/react";

describe("SplitLayout", () => {
  it("children을 flex 컨테이너 안에 렌더링해야 한다", () => {
    const { container } = render(
      <SplitLayout>
        <div>왼쪽</div>
        <div>오른쪽</div>
      </SplitLayout>
    );

    expect(screen.getByText("왼쪽")).toBeInTheDocument();
    expect(screen.getByText("오른쪽")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex", "min-h-screen", "items-stretch");
  });
});
