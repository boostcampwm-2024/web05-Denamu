import { describe, expect, it, vi } from "vitest";

import { PlatformBadge } from "@/components/RssRegistration/PlatformBadge.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

describe("PlatformBadge", () => {
  it("platform이 null이면 아무것도 렌더링하지 않아야 한다", () => {
    const { container } = render(<PlatformBadge platform={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("알려진 플랫폼이면 아이콘과 이름을 렌더링해야 한다", () => {
    render(<PlatformBadge platform="Tistory" />);

    expect(screen.getByText("Tistory")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Tistory" })).toHaveAttribute(
      "src",
      expect.stringContaining("tistory-icon.svg")
    );
  });

  it("알 수 없는 플랫폼이면 아이콘 없이 이름만 렌더링해야 한다", () => {
    render(<PlatformBadge platform="Custom" />);

    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("onClick이 있으면 클릭 시 호출하고 cursor 스타일을 적용해야 한다", () => {
    const onClick = vi.fn();
    render(<PlatformBadge platform="Velog" onClick={onClick} />);

    const badge = screen.getByText("Velog").closest("div");
    fireEvent.click(badge!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
