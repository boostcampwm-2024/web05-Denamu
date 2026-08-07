import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminMarketingEmailTab from "@/components/admin/marketingEmail/AdminMarketingEmailTab.tsx";

import { MarketingEmailPage, MarketingEmailSummary } from "@/types/marketingEmail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const useAdminMarketingEmailsMock = vi.hoisted(() => vi.fn());
const sendMutateMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());
const uploadImageMock = vi.hoisted(() => vi.fn());
const getDetailMock = vi.hoisted(() => vi.fn());

// @tinymce/tinymce-react mock: 실제 에디터 대신 textarea로 대체하고, 컴포넌트가 넘긴 props(특히
// init.images_upload_handler / init.file_picker_callback)를 테스트에서 직접 호출하기 위해 스파이로 기록.
const editorPropsSpy = vi.hoisted(() => vi.fn());

// AdminMarketingEmailTab import(위 5번째 줄)가 lucide-react를 로드하는 시점보다 lucideProxy 바인딩이
// 늦게 초기화되어 TDZ ReferenceError가 나므로, 동적 import로 참조 시점을 팩토리 실행 시점까지 늦춘다.
vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/queries/useAdminMarketingEmail", () => ({
  useAdminMarketingEmails: (params: unknown) => useAdminMarketingEmailsMock(params),
  useSendMarketingEmail: () => ({ mutate: sendMutateMock, isPending: false }),
}));

vi.mock("@/api/services/admin/marketingEmail", () => ({
  adminMarketingEmail: { uploadImage: uploadImageMock, getDetail: getDetailMock },
}));

vi.mock("@tinymce/tinymce-react", () => ({
  Editor: (props: { value: string; onEditorChange: (content: string) => void; init?: Record<string, unknown> }) => {
    editorPropsSpy(props);
    return <textarea aria-label="본문" value={props.value} onChange={(e) => props.onEditorChange(e.target.value)} />;
  },
}));

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
      <button data-testid="confirm-send" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

const makeItem = (overrides: Partial<MarketingEmailSummary> = {}): MarketingEmailSummary => ({
  id: 1,
  subject: "여름 신기능 소식",
  recipientCount: 120,
  authorName: "관리자",
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

const makePage = (
  result: MarketingEmailSummary[],
  totalCount = result.length
): MarketingEmailPage<MarketingEmailSummary> => ({
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
      <AdminMarketingEmailTab />
    </QueryClientProvider>
  );
};

describe("AdminMarketingEmailTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminMarketingEmailsMock.mockReturnValue({ data: makePage([]), isLoading: false, isError: false });
    sendMutateMock.mockImplementation((_payload, opts) =>
      opts?.onSuccess?.({
        id: 1,
        subject: "새 소식",
        recipientCount: 10,
        authorName: null,
        createdAt: "2026-07-20T09:00:00.000Z",
      })
    );
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    useAdminMarketingEmailsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderTab();

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 에러 문구를 표시한다", () => {
    useAdminMarketingEmailsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderTab();

    expect(screen.getByText("이력을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("발송 이력이 없으면 안내 문구를 표시한다", () => {
    renderTab();

    expect(screen.getByText("발송 이력이 없습니다.")).toBeInTheDocument();
  });

  it("발송 이력을 수신자 수 배지와 함께 카드로 렌더링한다", () => {
    useAdminMarketingEmailsMock.mockReturnValue({
      data: makePage([makeItem({ id: 1, subject: "여름 신기능 소식", recipientCount: 120, authorName: "관리자" })]),
      isLoading: false,
      isError: false,
    });
    renderTab();

    expect(screen.getByText("여름 신기능 소식")).toBeInTheDocument();
    expect(screen.getByText("수신 120명")).toBeInTheDocument();
    expect(screen.getByText("관리자")).toBeInTheDocument();
  });

  it("totalCount가 페이지 크기를 초과하면 다음 클릭 시 page 파라미터를 증가시킨다", () => {
    useAdminMarketingEmailsMock.mockReturnValue({ data: makePage([makeItem()], 25), isLoading: false, isError: false });
    renderTab();

    expect(useAdminMarketingEmailsMock).toHaveBeenLastCalledWith({ page: 1, limit: 10 });

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(useAdminMarketingEmailsMock).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
  });

  it("발송 이력 카드를 클릭하면 상세를 조회해 본문을 펼쳐서 보여준다", async () => {
    useAdminMarketingEmailsMock.mockReturnValue({
      data: makePage([makeItem({ id: 1, subject: "여름 신기능 소식" })]),
      isLoading: false,
      isError: false,
    });
    getDetailMock.mockResolvedValue({
      id: 1,
      subject: "여름 신기능 소식",
      content: "<p>안녕하세요, 회원님!</p>",
      recipientCount: 120,
      authorName: "관리자",
      createdAt: "2026-07-20T09:00:00.000Z",
    });
    renderTab();

    fireEvent.click(screen.getByText("여름 신기능 소식"));

    expect(getDetailMock).toHaveBeenCalledWith(1);
    await waitFor(() => expect(screen.getByText("안녕하세요, 회원님!")).toBeInTheDocument());
  });

  it("펼쳐진 카드를 다시 클릭하면 접히고, 또 클릭해도 캐시된 본문이라 재조회하지 않는다", async () => {
    useAdminMarketingEmailsMock.mockReturnValue({
      data: makePage([makeItem({ id: 1, subject: "여름 신기능 소식" })]),
      isLoading: false,
      isError: false,
    });
    getDetailMock.mockResolvedValue({
      id: 1,
      subject: "여름 신기능 소식",
      content: "<p>안녕하세요, 회원님!</p>",
      recipientCount: 120,
      authorName: "관리자",
      createdAt: "2026-07-20T09:00:00.000Z",
    });
    renderTab();

    fireEvent.click(screen.getByText("여름 신기능 소식"));
    await waitFor(() => expect(screen.getByText("안녕하세요, 회원님!")).toBeInTheDocument());

    fireEvent.click(screen.getByText("여름 신기능 소식"));
    expect(screen.queryByText("안녕하세요, 회원님!")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("여름 신기능 소식"));
    await waitFor(() => expect(screen.getByText("안녕하세요, 회원님!")).toBeInTheDocument());
    expect(getDetailMock).toHaveBeenCalledTimes(1);
  });

  it("상세 조회 실패 시 오류 toast를 띄우고 펼쳐진 상태를 유지하지 않는다", async () => {
    useAdminMarketingEmailsMock.mockReturnValue({
      data: makePage([makeItem({ id: 1, subject: "여름 신기능 소식" })]),
      isLoading: false,
      isError: false,
    });
    getDetailMock.mockRejectedValue(new Error("network error"));
    renderTab();

    fireEvent.click(screen.getByText("여름 신기능 소식"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ description: "발송 내역을 불러오지 못했습니다.", variant: "destructive" })
      )
    );
  });

  // AlertDialog를 flatten mock했기 때문에 트리거 버튼과 AlertDialogAction("발송")이 동시에
  // DOM에 존재해 이름이 충돌한다. 트리거는 항상 첫 번째로 렌더링되는 "발송" 버튼이다.
  const getSendTriggerButton = () => screen.getAllByRole("button", { name: "발송" })[0];

  it("제목/본문이 비어 있으면 발송 버튼이 비활성화된다", () => {
    renderTab();

    expect(getSendTriggerButton()).toBeDisabled();
  });

  it("제목만 입력하고 본문이 비어 있으면 발송 버튼이 비활성화된다", () => {
    renderTab();

    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "새 소식" } });

    expect(getSendTriggerButton()).toBeDisabled();
  });

  it("제목과 본문을 모두 입력하면 발송 버튼이 활성화된다", () => {
    renderTab();

    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "새 소식" } });
    fireEvent.change(screen.getByLabelText("본문"), { target: { value: "<p>내용</p>" } });

    expect(getSendTriggerButton()).toBeEnabled();
  });

  it("제목과 본문을 입력하고 발송 확인 시 sendMarketingEmail을 호출하고 성공 toast를 띄운 뒤 입력값을 초기화한다", () => {
    renderTab();

    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "새 소식" } });
    fireEvent.change(screen.getByLabelText("본문"), { target: { value: "<p>내용</p>" } });
    fireEvent.click(getSendTriggerButton());
    fireEvent.click(screen.getByTestId("confirm-send"));

    expect(sendMutateMock).toHaveBeenCalledWith({ subject: "새 소식", content: "<p>내용</p>" }, expect.any(Object));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ description: "10명에게 발송을 완료했습니다." }));
    expect(screen.getByLabelText("제목")).toHaveValue("");
    expect(screen.getByLabelText("본문")).toHaveValue("");
  });

  it("발송 실패 시 오류 toast를 띄운다", () => {
    sendMutateMock.mockImplementation((_payload, opts) => opts?.onError?.());
    renderTab();

    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "새 소식" } });
    fireEvent.change(screen.getByLabelText("본문"), { target: { value: "<p>내용</p>" } });
    fireEvent.click(getSendTriggerButton());
    fireEvent.click(screen.getByTestId("confirm-send"));

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ description: "발송 중 오류가 발생했습니다.", variant: "destructive" })
    );
  });

  type EditorInit = {
    file_picker_callback: (callback: (url: string, meta?: Record<string, string>) => void) => void;
    images_upload_handler: (blobInfo: { blob: () => Blob; filename: () => string }) => Promise<string>;
  };
  const latestEditorInit = () => (editorPropsSpy.mock.calls.at(-1)?.[0].init as EditorInit) ?? undefined;

  it("에디터 이미지 툴바 버튼으로 파일 선택 시 업로드 후 삽입 콜백에 URL을 전달한다", async () => {
    uploadImageMock.mockResolvedValue("https://cdn.example.com/marketing/a.png");
    renderTab();

    await waitFor(() => expect(latestEditorInit()).toBeDefined());
    const insertCallback = vi.fn();

    const createElementSpy = vi.spyOn(document, "createElement");
    latestEditorInit().file_picker_callback(insertCallback);
    const input = createElementSpy.mock.results.at(-1)?.value as HTMLInputElement;
    createElementSpy.mockRestore();

    const file = new File(["binary"], "photo.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change"));

    await waitFor(() => expect(uploadImageMock).toHaveBeenCalledWith(file));
    await waitFor(() =>
      expect(insertCallback).toHaveBeenCalledWith("https://cdn.example.com/marketing/a.png", { alt: "photo.png" })
    );
  });

  it("이미지 업로드 실패 시 오류 toast를 띄우고 삽입 콜백을 호출하지 않는다", async () => {
    uploadImageMock.mockRejectedValue(new Error("network error"));
    renderTab();

    await waitFor(() => expect(latestEditorInit()).toBeDefined());
    const insertCallback = vi.fn();

    const createElementSpy = vi.spyOn(document, "createElement");
    latestEditorInit().file_picker_callback(insertCallback);
    const input = createElementSpy.mock.results.at(-1)?.value as HTMLInputElement;
    createElementSpy.mockRestore();

    const file = new File(["binary"], "photo.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ description: "이미지 업로드에 실패했습니다.", variant: "destructive" })
      )
    );
    expect(insertCallback).not.toHaveBeenCalled();
  });

  it("붙여넣기/드래그로 들어온 이미지는 images_upload_handler로 업로드하고 URL을 반환한다", async () => {
    uploadImageMock.mockResolvedValueOnce("https://cdn.example.com/marketing/1.png");
    uploadImageMock.mockResolvedValueOnce("https://cdn.example.com/marketing/2.png");
    renderTab();

    await waitFor(() => expect(latestEditorInit()).toBeDefined());

    const blob1 = new Blob(["a"], { type: "image/png" });
    const blob2 = new Blob(["b"], { type: "image/png" });
    const url1 = await latestEditorInit().images_upload_handler({
      blob: () => blob1,
      filename: () => "a.png",
    });
    const url2 = await latestEditorInit().images_upload_handler({
      blob: () => blob2,
      filename: () => "b.png",
    });

    expect(url1).toBe("https://cdn.example.com/marketing/1.png");
    expect(url2).toBe("https://cdn.example.com/marketing/2.png");
    expect(uploadImageMock).toHaveBeenCalledTimes(2);
  });
});
