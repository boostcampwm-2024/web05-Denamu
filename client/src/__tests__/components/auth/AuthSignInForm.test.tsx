import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthSignInForm } from "@/components/auth/AuthSignInForm.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const submitForm = vi.fn();
const updateField = vi.fn();

let signInState: {
  form: { email: string; password: string };
  updateField: typeof updateField;
  isLoading: boolean;
  result: { success: boolean; message: string } | null;
  submitForm: typeof submitForm;
};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/signin", state: null }),
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
});
