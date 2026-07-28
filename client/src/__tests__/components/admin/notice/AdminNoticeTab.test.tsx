import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import AdminNoticeTab from "@/components/admin/notice/AdminNoticeTab.tsx";

import { NoticeDetail, NoticePage, NoticeSummary } from "@/types/notice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const useAdminNoticesMock = vi.hoisted(() => vi.fn());
const createMutateMock = vi.hoisted(() => vi.fn());
const updateMutateMock = vi.hoisted(() => vi.fn());
const deleteMutateMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());
const getDetailMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/queries/useAdminNotices", () => ({
  useAdminNotices: (params: unknown) => useAdminNoticesMock(params),
  useCreateNotice: () => ({ mutate: createMutateMock, isPending: false }),
  useUpdateNotice: () => ({ mutate: updateMutateMock, isPending: false }),
  useDeleteNotice: () => ({ mutate: deleteMutateMock, isPending: false }),
}));

vi.mock("@/api/services/admin/notice", () => ({
  adminNotice: { getDetail: getDetailMock },
}));

vi.mock("react-quill-new", () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="본문" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return { Select: pass, SelectContent: pass, SelectItem: pass, SelectTrigger: pass, SelectValue: pass };
});

vi.mock("@/components/ui/alert-dialog", () => {
  const pass = ({ children }: { children: ReactNode }) => <>{children}</>;
  return {
    AlertDialog: pass,
    AlertDialogTrigger: pass,
    AlertDialogContent: pass,
    AlertDialogHeader: pass,
    AlertDialogFooter: pass,
    AlertDialogTitle: pass,
    AlertDialogDescription: pass,
    AlertDialogCancel: ({ children }: { children: ReactNode }) => <button>{children}</button>,
    AlertDialogAction: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
      <button data-testid="confirm-delete" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

const makeNotice = (overrides: Partial<NoticeSummary> = {}): NoticeSummary => ({
  id: 1,
  title: "공지 제목",
  isPinned: false,
  status: "PUBLISHED",
  startAt: null,
  endAt: null,
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

const makePage = (result: NoticeSummary[], totalCount = result.length): NoticePage<NoticeSummary> => ({
  result,
  page: 1,
  limit: 10,
  totalCount,
  hasMore: false,
});

const renderTab = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminNoticeTab />
    </QueryClientProvider>
  );
};

describe("AdminNoticeTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminNoticesMock.mockReturnValue({ data: makePage([]), isLoading: false, isError: false });
    createMutateMock.mockImplementation((_payload, opts) => opts?.onSuccess?.());
    updateMutateMock.mockImplementation((_vars, opts) => opts?.onSuccess?.());
    deleteMutateMock.mockImplementation((_id, opts) => opts?.onSuccess?.());
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    useAdminNoticesMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderTab();

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 에러 문구를 표시한다", () => {
    useAdminNoticesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderTab();

    expect(screen.getByText("공지사항 목록을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("목록이 비어 있으면 안내 문구를 표시한다", () => {
    renderTab();

    expect(screen.getByText("등록된 공지사항이 없습니다.")).toBeInTheDocument();
  });

  it("공지 목록을 고정/상태 배지와 함께 카드로 렌더링한다", () => {
    useAdminNoticesMock.mockReturnValue({
      data: makePage([
        makeNotice({ id: 3, title: "서비스 정기 점검 안내", isPinned: true, status: "PUBLISHED" }),
        makeNotice({ id: 1, title: "작성 중인 공지", isPinned: false, status: "DRAFT" }),
      ]),
      isLoading: false,
      isError: false,
    });
    renderTab();

    const cards = screen.getAllByTestId("card-content");
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector(".truncate")).toHaveTextContent("서비스 정기 점검 안내");
    expect(within(cards[0]).getByText("고정")).toBeInTheDocument();
    expect(within(cards[0]).getByText("발행됨")).toBeInTheDocument();
    expect(cards[1].querySelector(".truncate")).toHaveTextContent("작성 중인 공지");
    expect(within(cards[1]).getByText("임시저장")).toBeInTheDocument();
  });

  it("totalCount가 페이지 크기를 초과하면 다음 클릭 시 page 파라미터를 증가시킨다", () => {
    useAdminNoticesMock.mockReturnValue({ data: makePage([makeNotice()], 25), isLoading: false, isError: false });
    renderTab();

    expect(useAdminNoticesMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, status: undefined });

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(useAdminNoticesMock).toHaveBeenLastCalledWith({ page: 2, limit: 10, status: undefined });
  });

  it("상태 필터 탭 전환 시 해당 status로 조회한다", () => {
    useAdminNoticesMock.mockReturnValue({ data: makePage([makeNotice()]), isLoading: false, isError: false });
    renderTab();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "임시저장" }), { button: 0 });

    expect(useAdminNoticesMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, status: "DRAFT" });
  });

  it("작성 버튼 클릭 시 작성 폼으로 전환하고, 제목이 비어 있으면 제출 버튼이 비활성화된다", () => {
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "공지사항 작성" }));

    expect(screen.getByRole("heading", { name: "공지사항 작성" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "작성" })).toBeDisabled();
  });

  it("제목을 입력하고 작성하면 createNotice를 호출하고 성공 toast를 띄운 뒤 목록으로 돌아간다", () => {
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "공지사항 작성" }));
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "새 공지" } });
    fireEvent.change(screen.getByLabelText("본문"), { target: { value: "<p>내용</p>" } });
    fireEvent.click(screen.getByRole("button", { name: "작성" }));

    expect(createMutateMock).toHaveBeenCalledWith(
      {
        title: "새 공지",
        content: "<p>내용</p>",
        isPinned: false,
        status: "DRAFT",
        startAt: undefined,
        endAt: undefined,
      },
      expect.any(Object)
    );
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ description: "공지사항이 작성되었습니다." }));
    expect(screen.queryByRole("heading", { name: "공지사항 작성" })).not.toBeInTheDocument();
  });

  it("작성 실패 시 오류 toast를 띄운다", () => {
    createMutateMock.mockImplementation((_payload, opts) => opts?.onError?.());
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "공지사항 작성" }));
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "새 공지" } });
    fireEvent.click(screen.getByRole("button", { name: "작성" }));

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ description: "요청 처리 중 오류가 발생했습니다.", variant: "destructive" })
    );
  });

  it("수정 아이콘 클릭 시 상세를 불러와 폼에 값을 채운다", async () => {
    const notice = makeNotice({ id: 9, title: "기존 공지" });
    useAdminNoticesMock.mockReturnValue({ data: makePage([notice]), isLoading: false, isError: false });
    const detail: NoticeDetail = {
      ...notice,
      content: "<p>기존 본문</p>",
      authorName: "관리자",
      updatedAt: notice.createdAt,
    };
    getDetailMock.mockResolvedValue(detail);
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "수정" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "공지사항 수정" })).toBeInTheDocument());
    expect(getDetailMock).toHaveBeenCalledWith(9);
    expect(screen.getByLabelText("제목")).toHaveValue("기존 공지");
    expect(screen.getByLabelText("본문")).toHaveValue("<p>기존 본문</p>");
  });

  it("수정 폼 제출 시 updateNotice를 {id, payload}로 호출한다", async () => {
    const notice = makeNotice({ id: 9, title: "기존 공지" });
    useAdminNoticesMock.mockReturnValue({ data: makePage([notice]), isLoading: false, isError: false });
    const detail: NoticeDetail = {
      ...notice,
      content: "<p>기존 본문</p>",
      authorName: "관리자",
      updatedAt: notice.createdAt,
    };
    getDetailMock.mockResolvedValue(detail);
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "수정" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "공지사항 수정" })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "수정된 제목" } });
    fireEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(updateMutateMock).toHaveBeenCalledWith(
      {
        id: 9,
        payload: {
          title: "수정된 제목",
          content: "<p>기존 본문</p>",
          isPinned: false,
          status: "PUBLISHED",
          startAt: null,
          endAt: null,
        },
      },
      expect.any(Object)
    );
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ description: "공지사항이 수정되었습니다." }));
  });

  it("삭제 확인 시 deleteNotice를 호출하고 성공 toast를 띄운다", () => {
    useAdminNoticesMock.mockReturnValue({
      data: makePage([makeNotice({ id: 11, title: "삭제할 공지" })]),
      isLoading: false,
      isError: false,
    });
    renderTab();

    fireEvent.click(screen.getByTestId("confirm-delete"));

    expect(deleteMutateMock).toHaveBeenCalledWith(11, expect.any(Object));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ description: "공지사항이 삭제되었습니다." }));
  });
});
