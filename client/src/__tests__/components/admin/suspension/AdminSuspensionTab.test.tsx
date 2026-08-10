import { describe, expect, it, vi } from "vitest";

import AdminSuspensionTab from "@/components/admin/suspension/AdminSuspensionTab.tsx";

import { SuspendedUserItem } from "@/types/userSuspension";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

const useSuspendedUsersMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/hooks/queries/useUserSuspension", () => ({
  useSuspendedUsers: () => useSuspendedUsersMock(),
}));

const makeSuspension = (overrides: Partial<SuspendedUserItem> = {}): SuspendedUserItem => ({
  id: 1,
  user: { userName: "스팸유저", email: "spam-user@test.com" },
  admin: { name: "관리자1" },
  detail: "반복적인 스팸 신고 누적으로 정지합니다.",
  suspendedUntil: null,
  createdAt: "2026-06-25T09:00:00.000Z",
  ...overrides,
});

const makeQueryResult = (
  overrides: Partial<{
    result: SuspendedUserItem[];
    isLoading: boolean;
    isError: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  }> = {}
) => {
  const {
    result = [],
    isLoading = false,
    isError = false,
    hasNextPage = false,
    isFetchingNextPage = false,
  } = overrides;
  return {
    data: { pages: [{ result, lastId: 0, hasMore: hasNextPage }] },
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: vi.fn(),
  };
};

const renderTab = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminSuspensionTab />
    </QueryClientProvider>
  );
};

describe("AdminSuspensionTab", () => {
  it("로딩 중이면 로딩 문구를 표시한다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult({ isLoading: true }));
    renderTab();

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 에러 문구를 표시한다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult({ isError: true }));
    renderTab();

    expect(screen.getByText("정지된 유저 목록을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("정지된 유저가 없으면 안내 문구를 표시한다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult());
    renderTab();

    expect(screen.getByText("정지된 유저가 없습니다.")).toBeInTheDocument();
  });

  it("영구 정지 유저는 영구 정지 배지와 처리자 이름을 표시한다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult({ result: [makeSuspension({ suspendedUntil: null })] }));
    renderTab();

    expect(screen.getByText(/영구 정지/)).toBeInTheDocument();
    expect(screen.getByText(/스팸유저/)).toBeInTheDocument();
    expect(screen.getByText("처리자: 관리자1")).toBeInTheDocument();
  });

  it("기간 정지 유저는 정지 종료 일시를 배지에 표시한다", () => {
    useSuspendedUsersMock.mockReturnValue(
      makeQueryResult({ result: [makeSuspension({ suspendedUntil: "2026-07-02T09:00:00.000Z" })] })
    );
    renderTab();

    expect(screen.getByText(/까지 정지/)).toBeInTheDocument();
    expect(screen.queryByText(/^영구 정지$/)).not.toBeInTheDocument();
  });

  it("처리자 정보가 없으면 알 수 없음으로 표시한다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult({ result: [makeSuspension({ admin: null })] }));
    renderTab();

    expect(screen.getByText("처리자: 알 수 없음")).toBeInTheDocument();
  });

  it("다음 페이지가 있으면 더 보기 버튼을 표시하고 클릭 시 fetchNextPage를 호출한다", () => {
    const queryResult = makeQueryResult({ result: [makeSuspension()], hasNextPage: true });
    useSuspendedUsersMock.mockReturnValue(queryResult);
    renderTab();

    const loadMoreButton = screen.getByRole("button", { name: "더 보기" });
    fireEvent.click(loadMoreButton);

    expect(queryResult.fetchNextPage).toHaveBeenCalled();
  });

  it("다음 페이지가 없으면 더 보기 버튼을 표시하지 않는다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult({ result: [makeSuspension()], hasNextPage: false }));
    renderTab();

    expect(screen.queryByRole("button", { name: "더 보기" })).not.toBeInTheDocument();
  });
});
