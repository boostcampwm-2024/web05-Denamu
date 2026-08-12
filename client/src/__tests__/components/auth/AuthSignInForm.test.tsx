import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthSignInForm } from "@/components/auth/AuthSignInForm.tsx";

import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const mockSetSearchParams = vi.fn();
const submitForm = vi.fn();
const updateField = vi.fn();
let mockSearchParams: URLSearchParams;

let signInState: {
  form: { email: string; password: string };
  updateField: typeof updateField;
  isLoading: boolean;
  result: {
    success: boolean;
    message: string;
    status?: number;
    suspension?: { detail: string; suspendedUntil: string | null };
  } | null;
  submitForm: typeof submitForm;
};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/signin", state: null }),
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

vi.mock("@/hooks/auth/useSignIn", () => ({
  useSignIn: () => signInState,
}));

vi.mock("@/hooks/common/useCustomToast.ts", () => ({
  useCustomToast: () => ({ toast: mockToast }),
}));

vi.mock("@/components/auth/AuthSocialLoginButtons.tsx", () => ({
  AuthSocialLoginButtons: () => <div data-testid="social-login" />,
}));

describe("AuthSignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    signInState = {
      form: { email: "", password: "" },
      updateField,
      isLoading: false,
      result: null,
      submitForm,
    };
  });

  it("이메일/비밀번호 입력과 로그인 버튼을 렌더링해야 한다", () => {
    render(<AuthSignInForm />);

    expect(screen.getByPlaceholderText("이메일을 입력하세요")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호를 입력하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("입력 시 updateField가 호출되어야 한다", () => {
    render(<AuthSignInForm />);

    fireEvent.change(screen.getByPlaceholderText("이메일을 입력하세요"), { target: { value: "a@b.com" } });

    expect(updateField).toHaveBeenCalledWith("email", "a@b.com");
  });

  it("폼 제출 시 submitForm이 호출되어야 한다", () => {
    render(<AuthSignInForm />);

    fireEvent.submit(screen.getByRole("button", { name: "로그인" }).closest("form")!);

    expect(submitForm).toHaveBeenCalledTimes(1);
  });

  it("isLoading이면 버튼이 '로그인 중...'이고 비활성화되어야 한다", () => {
    signInState.isLoading = true;
    render(<AuthSignInForm />);

    const button = screen.getByRole("button", { name: "로그인 중..." });
    expect(button).toBeDisabled();
  });

  it("로그인 성공 result가 오면 성공 toast를 띄우고 이동해야 한다", () => {
    signInState.result = { success: true, message: "환영합니다" };
    render(<AuthSignInForm />);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "로그인 성공" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("로그인 실패 result가 오면 destructive toast를 띄워야 한다", () => {
    signInState.result = { success: false, message: "실패" };
    render(<AuthSignInForm />);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "로그인 실패", variant: "destructive" }));
  });

  it("정지된 계정으로 로그인 실패 시 사유·해제일·문의 안내가 담긴 다이얼로그를 띄우고 toast는 띄우지 않아야 한다", () => {
    signInState.result = {
      success: false,
      message: "정지된 계정입니다.",
      status: 403,
      suspension: { detail: "부적절한 게시글 반복 등록", suspendedUntil: "2026-12-31T00:00:00.000Z" },
    };
    render(<AuthSignInForm />);

    expect(screen.getByText("정지된 계정입니다")).toBeInTheDocument();
    expect(screen.getByText(/부적절한 게시글 반복 등록/)).toBeInTheDocument();
    expect(screen.getByText(/boostcamp9web05@gmail.com/)).toBeInTheDocument();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("정지 해제일이 없으면 '무기한'으로 표시해야 한다", () => {
    signInState.result = {
      success: false,
      message: "정지된 계정입니다.",
      status: 403,
      suspension: { detail: "약관 위반", suspendedUntil: null },
    };
    render(<AuthSignInForm />);

    expect(screen.getByText(/무기한/)).toBeInTheDocument();
  });

  it("onSuccess가 주어지면 성공 시 onSuccess만 호출하고 navigate하지 않아야 한다", () => {
    const onSuccess = vi.fn();
    signInState.result = { success: true, message: "ok" };
    render(<AuthSignInForm onSuccess={onSuccess} />);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("hideBackButton이 true면 'Denamu 홈으로 돌아가기' 버튼이 없어야 한다", () => {
    render(<AuthSignInForm hideBackButton />);

    expect(screen.queryByRole("button", { name: "Denamu 홈으로 돌아가기" })).not.toBeInTheDocument();
  });

  it("쿼리에 error가 없으면 재가입 제한 toast를 띄우지 않아야 한다", () => {
    render(<AuthSignInForm />);

    expect(mockToast).not.toHaveBeenCalled();
    expect(mockSetSearchParams).not.toHaveBeenCalled();
  });

  it("rejoin_restricted 쿼리가 있으면 재가입 제한 toast를 띄우고 쿼리를 정리해야 한다", () => {
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams("error=rejoin_restricted&availableAt=2026-11-01T00:00:00.000Z");
    render(<AuthSignInForm />);
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "재가입 제한",
        description: expect.stringContaining("이후 다시 시도해주세요"),
        variant: "destructive",
      })
    );
    const [cleanedParams, options] = mockSetSearchParams.mock.calls[0];
    expect(cleanedParams.get("error")).toBeNull();
    expect(cleanedParams.get("availableAt")).toBeNull();
    expect(options).toEqual({ replace: true });
  });

  it("availableAt이 없거나 파싱 불가능하면 '잠시 후'로 안내해야 한다", () => {
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams("error=rejoin_restricted");
    render(<AuthSignInForm />);
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("잠시 후"),
      })
    );
  });

  it("error가 rejoin_restricted가 아니면 재가입 제한 toast를 띄우지 않아야 한다", () => {
    mockSearchParams = new URLSearchParams("error=other");
    render(<AuthSignInForm />);

    expect(mockToast).not.toHaveBeenCalled();
  });
});
