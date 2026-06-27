import { beforeEach, describe, expect, it, vi } from "vitest";

import { SectionHeader } from "@/components/common/SectionHeader.tsx";

import { LucideIcon } from "lucide-react";
import { fireEvent, render, screen } from "@testing-library/react";

const setPostType = vi.fn();
let postType: "latest" | "recommend";

vi.mock("@/store/usePostTypeStore", () => ({
  usePostTypeStore: () => ({ postType, setPostType }),
}));

const Icon = ((props: { className?: string }) => (
  <svg data-testid="header-icon" {...props} />
)) as unknown as LucideIcon;

describe("SectionHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postType = "latest";
  });

  it("icon, text, description을 렌더링해야 한다", () => {
    render(<SectionHeader icon={Icon} text="최신 포스트" iconColor="text-orange-500" description="최근 작성된 글" />);

    expect(screen.getByTestId("header-icon")).toBeInTheDocument();
    expect(screen.getByText("최신 포스트")).toBeInTheDocument();
    expect(screen.getByText("최근 작성된 글")).toBeInTheDocument();
  });

  it("secondText가 있으면 두 번째 탭을 렌더링하고 클릭 시 setPostType('recommend')를 호출해야 한다", () => {
    render(
      <SectionHeader
        icon={Icon}
        text="최신 포스트"
        iconColor="text-orange-500"
        description="최근 작성된 글"
        secondText="추천 포스트"
        secondDescription="맞춤 추천"
      />
    );

    fireEvent.click(screen.getByText("추천 포스트"));

    expect(setPostType).toHaveBeenCalledWith("recommend");
  });

  it("postType이 latest가 아니면 text 클릭 시 setPostType('latest')를 호출해야 한다", () => {
    postType = "recommend";
    render(
      <SectionHeader
        icon={Icon}
        text="최신 포스트"
        iconColor="text-orange-500"
        description="최근 작성된 글"
        secondText="추천 포스트"
        secondDescription="맞춤 추천"
      />
    );

    fireEvent.click(screen.getByText("최신 포스트"));

    expect(setPostType).toHaveBeenCalledWith("latest");
  });

  it("postType이 recommend면 secondDescription을 표시해야 한다", () => {
    postType = "recommend";
    render(
      <SectionHeader
        icon={Icon}
        text="최신 포스트"
        iconColor="text-orange-500"
        description="최근 작성된 글"
        secondText="추천 포스트"
        secondDescription="맞춤 추천"
      />
    );

    expect(screen.getByText("맞춤 추천")).toBeInTheDocument();
  });
});
