import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { RssFeedRow } from "@/components/profile/rss/RssFeedRow.tsx";

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("lucide-react", () => lucideProxy());

const renderRow = (props: Partial<Parameters<typeof RssFeedRow>[0]> = {}) =>
  render(
    <MemoryRouter>
      <RssFeedRow id={1} title="피드 제목" createdAt="2024-03-26" commentCount={2} likeCount={5} {...props} />
    </MemoryRouter>
  );

describe("RssFeedRow", () => {
  it("공개 글은 상세 링크로 렌더링하고 댓글/좋아요 수를 표시해야 한다", () => {
    renderRow();

    expect(screen.getByRole("link", { name: "피드 제목" })).toHaveAttribute("href", "/1");
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("비공개 글은 링크 대신 잠금 아이콘과 텍스트로 렌더링해야 한다", () => {
    renderRow({ isPublic: false, onToggleVisibility: vi.fn() });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("피드 제목")).toBeInTheDocument();
    expect(screen.getByTestId("lucide-Lock")).toBeInTheDocument();
  });

  it("onToggleVisibility가 있으면 토글 버튼 클릭 시 반대 공개 상태로 호출해야 한다", () => {
    const onToggleVisibility = vi.fn();
    renderRow({ isPublic: true, onToggleVisibility });

    fireEvent.click(screen.getByRole("button", { name: "비공개로 전환" }));

    expect(onToggleVisibility).toHaveBeenCalledWith(false);
  });
});
