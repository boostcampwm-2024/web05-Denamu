import { describe, it, expect } from "vitest";

import { PostCardImage } from "@/components/common/Card/PostCardImage";

import { render, screen } from "@testing-library/react";

describe("PostCardImage", () => {
  it("thumbnail이 제공되었을 때 LazyImage가 렌더링되는지 확인", () => {
    render(<PostCardImage thumbnail="test-image.jpg" alt="테스트 이미지" />);

    const image = screen.getByTestId("lazy-image");
    expect(image).toBeInTheDocument();
    expect(screen.queryByTestId("fallback-icon")).not.toBeInTheDocument();
  });

  it("thumbnail이 없을 때 대체 아이콘이 렌더링되는지 확인", () => {
    render(<PostCardImage alt="테스트 이미지" />);

    const fallbackContainer = screen.getByTestId("fallback-icon");
    expect(fallbackContainer).toBeInTheDocument();
    expect(screen.queryByTestId("lazy-image")).not.toBeInTheDocument();
  });

  it("container에 올바른 class가 적용되는지 확인", () => {
    render(<PostCardImage alt="테스트 이미지" />);

    const container = screen.getByTestId("image-container");
    expect(container).toHaveClass("h-full", "md:h-[120px]", "rounded", "md:rounded-t-xl");
  });
});
