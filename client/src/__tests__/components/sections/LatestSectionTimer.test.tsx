import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import LatestSectionTimer from "@/components/sections/LatestSectionTimer.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mutate = vi.fn();
let updateState: { mutate: typeof mutate; isPending: boolean; isError: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useUpdatePost", () => ({
  useUpdatePost: () => updateState,
}));

describe("LatestSectionTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    updateState = { mutate, isPending: false, isError: false };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("기본 상태에서는 남은 시간과 '후 업데이트' 텍스트를 렌더링해야 한다", () => {
    render(<LatestSectionTimer />);

    expect(screen.getByText(/후 업데이트/)).toBeInTheDocument();
  });

  it("isPending이면 RotateCw 아이콘을 렌더링해야 한다", () => {
    updateState.isPending = true;
    render(<LatestSectionTimer />);

    expect(screen.getByTestId("lucide-RotateCw")).toBeInTheDocument();
    expect(screen.queryByText(/후 업데이트/)).not.toBeInTheDocument();
  });

  it("isError이면 reload 버튼이 보이고 클릭 시 mutate를 호출해야 한다", () => {
    updateState.isError = true;
    render(<LatestSectionTimer />);

    const reload = screen.getByRole("button", { name: "reload" });
    fireEvent.click(reload);

    expect(mutate).toHaveBeenCalled();
  });
});
