import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { FixedHeader } from "@/components/common/Card/detail/FixedHeader.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("FixedHeader", () => {
  it("title을 렌더링해야 한다", () => {
    render(<FixedHeader title="고정 헤더 제목" onClose={vi.fn()} scrollbarWidth={10} />);

    expect(screen.getByText("고정 헤더 제목")).toBeInTheDocument();
  });

  it("닫기 버튼 클릭 시 onClose를 호출해야 한다", () => {
    const onClose = vi.fn();
    render(<FixedHeader title="t" onClose={onClose} scrollbarWidth={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
