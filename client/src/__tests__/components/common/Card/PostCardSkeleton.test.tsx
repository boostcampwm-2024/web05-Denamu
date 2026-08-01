import { describe, expect, it } from "vitest";

import { PostCardSkeleton, PostGridSkeleton } from "@/components/common/Card/PostCardSkeleton.tsx";

import { render } from "@testing-library/react";

describe("PostCardSkeleton", () => {
  it("스켈레톤 카드를 렌더링해야 한다", () => {
    const { container } = render(<PostCardSkeleton />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
  });
});

describe("PostGridSkeleton", () => {
  it("기본 count(4)만큼 스켈레톤 카드를 렌더링해야 한다", () => {
    const { container } = render(<PostGridSkeleton />);

    expect(container.firstChild?.childNodes).toHaveLength(4);
  });

  it("count prop만큼 스켈레톤 카드를 렌더링해야 한다", () => {
    const { container } = render(<PostGridSkeleton count={8} />);

    expect(container.firstChild?.childNodes).toHaveLength(8);
  });
});
