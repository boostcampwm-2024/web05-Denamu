import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { SubscribersModal } from "@/components/profile/rss/SubscribersModal.tsx";

import { Subscriber } from "@/types/subscription.ts";
import { fireEvent, render, screen } from "@testing-library/react";

let subscribersState: {
  data: { pages: Array<{ result: Subscriber[] }> } | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  useBlogSubscribers: () => subscribersState,
}));

const renderModal = (open = true) =>
  render(<SubscribersModal rssId={1} rssName="내 블로그" open={open} onClose={vi.fn()} />);

describe("SubscribersModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribersState = {
      data: { pages: [{ result: [] }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    };
  });

  it("open=false면 아무것도 렌더링하지 않아야 한다", () => {
    renderModal(false);
    expect(screen.queryByText("구독자 목록")).not.toBeInTheDocument();
  });

  it("로딩 중이면 로딩 문구를 표시해야 한다", () => {
    subscribersState.isLoading = true;
    renderModal();
    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러면 에러 문구를 표시해야 한다", () => {
    subscribersState.isError = true;
    renderModal();
    expect(screen.getByText("구독자를 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("구독자가 없으면 빈 상태 문구를 표시해야 한다", () => {
    renderModal();
    expect(screen.getByText("아직 구독자가 없습니다.")).toBeInTheDocument();
  });

  it("구독자 목록을 렌더링하고 프로필 이미지 유무에 따라 이미지/이니셜을 표시해야 한다", () => {
    subscribersState.data = {
      pages: [
        {
          result: [
            { id: 1, userId: 11, userName: "김구독", profileImage: "https://img.test/a.png" },
            { id: 2, userId: 12, userName: "이구독", profileImage: null },
          ],
        },
      ],
    };
    renderModal();

    expect(screen.getByText("김구독")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "김구독" })).toBeInTheDocument();
    // profileImage가 없으면 이름 첫 글자 이니셜
    expect(screen.getByText("이")).toBeInTheDocument();
  });

  it("다음 페이지가 있으면 '더 보기' 클릭 시 fetchNextPage를 호출해야 한다", () => {
    subscribersState.hasNextPage = true;
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
    expect(subscribersState.fetchNextPage).toHaveBeenCalled();
  });
});
