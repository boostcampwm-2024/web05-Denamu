import { beforeEach, describe, expect, it, vi } from "vitest";

import { NavigationButtons } from "@/components/layout/sidebar/NavigationButtons.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const setTap = vi.fn();
let tap: "main" | "chart";

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/useTapStore", () => ({
  useTapStore: () => ({ tap, setTap }),
}));

describe("NavigationButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tap = "main";
  });

  it("'서비스 소개' 클릭 시 /about으로 이동해야 한다", () => {
    render(<NavigationButtons onAction={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "서비스 소개" }));

    expect(mockNavigate).toHaveBeenCalledWith("/about");
  });

  it("tap이 main이면 '차트' 버튼이 보이고 클릭 시 chart로 전환 후 onAction을 호출해야 한다", () => {
    const onAction = vi.fn();
    render(<NavigationButtons onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "차트" }));

    expect(setTap).toHaveBeenCalledWith("chart");
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("tap이 chart이면 '홈' 버튼이 보이고 클릭 시 main으로 전환해야 한다", () => {
    tap = "chart";
    render(<NavigationButtons onAction={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "홈" }));

    expect(setTap).toHaveBeenCalledWith("main");
  });
});
