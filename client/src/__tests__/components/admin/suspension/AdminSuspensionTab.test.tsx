import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminSuspensionTab from "@/components/admin/suspension/AdminSuspensionTab.tsx";

import { UserSearchResult } from "@/types/search";
import { SuspendedUserItem } from "@/types/userSuspension";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

const useSuspendedUsersMock = vi.hoisted(() => vi.fn());
const useCreateUserSuspensionMock = vi.hoisted(() => vi.fn());
const useUpdateUserSuspensionMock = vi.hoisted(() => vi.fn());
const useDeleteUserSuspensionMock = vi.hoisted(() => vi.fn());
const useUserSearchMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/hooks/queries/useUserSuspension", () => ({
  useSuspendedUsers: () => useSuspendedUsersMock(),
  useCreateUserSuspension: () => useCreateUserSuspensionMock(),
  useUpdateUserSuspension: () => useUpdateUserSuspensionMock(),
  useDeleteUserSuspension: () => useDeleteUserSuspensionMock(),
}));

vi.mock("@/hooks/queries/useUserSearch", () => ({
  useUserSearch: () => useUserSearchMock(),
}));

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: toastMock }),
}));

const makeSuspension = (overrides: Partial<SuspendedUserItem> = {}): SuspendedUserItem => ({
  id: 1,
  user: { id: 30, userName: "스팸유저", email: "spam-user@test.com" },
  admin: { name: "관리자1" },
  detail: "반복적인 스팸 신고 누적으로 정지합니다.",
  suspendedUntil: null,
  createdAt: "2026-06-25T09:00:00.000Z",
  ...overrides,
});

const makeSearchUser = (overrides: Partial<UserSearchResult> = {}): UserSearchResult => ({
  id: 10,
  userName: "검색된유저",
  profileImage: null,
  introduction: null,
  blogCount: 0,
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

const makeSearchResult = (users: UserSearchResult[] = [], isLoading = false) => ({
  data: { data: { result: users, totalCount: users.length, totalPages: 1 } },
  isLoading,
  error: null,
});

const renderTab = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminSuspensionTab />
    </QueryClientProvider>
  );
};

describe("AdminSuspensionTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserSearchMock.mockReturnValue(makeSearchResult());
    useCreateUserSuspensionMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useUpdateUserSuspensionMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useDeleteUserSuspensionMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

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

  it("검색어를 입력하면 검색 결과 유저를 카드로 보여준다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult());
    useUserSearchMock.mockReturnValue(makeSearchResult([makeSearchUser()]));
    renderTab();

    fireEvent.change(screen.getByPlaceholderText("정지할 유저의 닉네임을 검색하세요"), {
      target: { value: "검색된유저" },
    });

    expect(screen.getByText("검색된유저")).toBeInTheDocument();
  });

  it("검색 결과의 정지 버튼 클릭 시 해당 유저 이름으로 정지 다이얼로그가 열린다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult());
    useUserSearchMock.mockReturnValue(makeSearchResult([makeSearchUser({ userName: "검색된유저" })]));
    renderTab();

    fireEvent.change(screen.getByPlaceholderText("정지할 유저의 닉네임을 검색하세요"), {
      target: { value: "검색된유저" },
    });
    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(screen.getByText("검색된유저 유저 정지")).toBeInTheDocument();
  });

  it("정지 다이얼로그에서 상세 내역을 입력하고 제출하면 createUserSuspension을 호출한다", () => {
    const mutateMock = vi.fn();
    useSuspendedUsersMock.mockReturnValue(makeQueryResult());
    useUserSearchMock.mockReturnValue(makeSearchResult([makeSearchUser({ id: 42, userName: "검색된유저" })]));
    useCreateUserSuspensionMock.mockReturnValue({ mutate: mutateMock, isPending: false });
    renderTab();

    fireEvent.change(screen.getByPlaceholderText("정지할 유저의 닉네임을 검색하세요"), {
      target: { value: "검색된유저" },
    });
    fireEvent.click(screen.getByRole("button", { name: "정지" }));
    fireEvent.change(screen.getByPlaceholderText("정지 사유 및 처리 내용을 입력해주세요."), {
      target: { value: "악성 게시글 반복 작성" },
    });
    fireEvent.click(screen.getByRole("button", { name: "정지 처리" }));

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42, detail: "악성 게시글 반복 작성" }),
      expect.any(Object)
    );
  });

  it("해제 버튼 클릭 시 해당 유저 이름으로 해제 확인 다이얼로그가 열린다", () => {
    useSuspendedUsersMock.mockReturnValue(makeQueryResult({ result: [makeSuspension()] }));
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "해제" }));

    expect(screen.getByText("스팸유저 유저 정지 해제")).toBeInTheDocument();
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("무효처리 토글 없이 해제하면 정지 기간을 현재로 바꾸는 updateUserSuspension을 호출한다", () => {
    const updateMutateMock = vi.fn();
    const deleteMutateMock = vi.fn();
    useSuspendedUsersMock.mockReturnValue(
      makeQueryResult({
        result: [makeSuspension({ user: { id: 55, userName: "스팸유저", email: "spam-user@test.com" } })],
      })
    );
    useUpdateUserSuspensionMock.mockReturnValue({ mutate: updateMutateMock, isPending: false });
    useDeleteUserSuspensionMock.mockReturnValue({ mutate: deleteMutateMock, isPending: false });
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "해제" }));
    const releaseButtons = screen.getAllByRole("button", { name: "해제" });
    fireEvent.click(releaseButtons[releaseButtons.length - 1]);

    expect(updateMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 55, suspendedUntil: expect.any(String) }),
      expect.any(Object)
    );
    expect(deleteMutateMock).not.toHaveBeenCalled();
  });

  it("무효처리 토글 후 해제하면 deleteUserSuspension을 호출해 정지 내역을 삭제한다", () => {
    const updateMutateMock = vi.fn();
    const deleteMutateMock = vi.fn();
    useSuspendedUsersMock.mockReturnValue(
      makeQueryResult({
        result: [makeSuspension({ user: { id: 55, userName: "스팸유저", email: "spam-user@test.com" } })],
      })
    );
    useUpdateUserSuspensionMock.mockReturnValue({ mutate: updateMutateMock, isPending: false });
    useDeleteUserSuspensionMock.mockReturnValue({ mutate: deleteMutateMock, isPending: false });
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "해제" }));
    fireEvent.click(screen.getByRole("switch"));
    const releaseButtons = screen.getAllByRole("button", { name: "해제" });
    fireEvent.click(releaseButtons[releaseButtons.length - 1]);

    expect(deleteMutateMock).toHaveBeenCalledWith(55, expect.any(Object));
    expect(updateMutateMock).not.toHaveBeenCalled();
  });

  it("기간 수정 버튼 클릭 시 해당 유저 이름으로 기간 수정 다이얼로그가 열린다", () => {
    useSuspendedUsersMock.mockReturnValue(
      makeQueryResult({ result: [makeSuspension({ suspendedUntil: "2026-07-02T09:00:00.000Z" })] })
    );
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "기간 수정" }));

    expect(screen.getByText("스팸유저 유저 정지 기간 수정")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수정 처리" })).toBeInTheDocument();
  });
});
