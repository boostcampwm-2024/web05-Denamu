import { beforeEach, describe, expect, it, vi } from "vitest";

import Filter from "@/components/filter/Filter.tsx";

import { useFilterStore } from "@/store/useFilterStore.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const categories = [
  { category: "언어", tags: ["JavaScript", "Python"] },
  { category: "프레임워크", tags: ["React"] },
];

vi.mock("@/hooks/queries/useTags", () => ({
  useTags: () => ({ data: categories }),
}));

describe("Filter", () => {
  beforeEach(() => {
    useFilterStore.setState({ filters: [] });
  });

  it("초기에는 '카테고리' 라벨과 '열기' 버튼만 보이고 태그는 숨겨져 있어야 한다", () => {
    render(<Filter />);

    expect(screen.getByText("카테고리")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "열기" })).toBeInTheDocument();
    expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
  });

  it("'열기' 클릭 시 카테고리 키와 첫 카테고리의 태그가 표시되어야 한다", () => {
    render(<Filter />);

    fireEvent.click(screen.getByRole("button", { name: "열기" }));

    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.getByText("언어")).toBeInTheDocument();
    expect(screen.getByText("프레임워크")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("다른 카테고리 클릭 시 해당 카테고리의 태그로 전환되어야 한다", () => {
    render(<Filter />);
    fireEvent.click(screen.getByRole("button", { name: "열기" }));

    fireEvent.click(screen.getByText("프레임워크"));

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
  });

  it("태그 클릭 시 필터에 추가되어 활성 스타일이 적용되어야 한다", () => {
    render(<Filter />);
    fireEvent.click(screen.getByRole("button", { name: "열기" }));

    const tag = screen.getByText("JavaScript");
    fireEvent.click(tag);

    expect(useFilterStore.getState().filters).toContain("JavaScript");
    expect(tag).toHaveClass("bg-primary", "text-white");
  });

  it("이미 선택된 태그를 다시 클릭하면 필터에서 제거되어야 한다", () => {
    useFilterStore.setState({ filters: ["JavaScript"] });
    render(<Filter />);
    fireEvent.click(screen.getByRole("button", { name: "열기" }));

    fireEvent.click(screen.getByText("JavaScript"));

    expect(useFilterStore.getState().filters).not.toContain("JavaScript");
  });
});
