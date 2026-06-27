import { describe, expect, it, vi } from "vitest";

import { RssButton } from "@/components/layout/sidebar/RssButton.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

describe("RssButton", () => {
  it("'블로그 등록' 버튼을 렌더링해야 한다", () => {
    render(<RssButton onRssClick={vi.fn()} onAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "블로그 등록" })).toBeInTheDocument();
  });

  it("클릭 시 onRssClick과 onAction을 모두 호출해야 한다", () => {
    const onRssClick = vi.fn();
    const onAction = vi.fn();
    render(<RssButton onRssClick={onRssClick} onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "블로그 등록" }));

    expect(onRssClick).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
