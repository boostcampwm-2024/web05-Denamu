import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthSignUpForm } from "@/components/auth/AuthSignUpForm.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const submitForm = vi.fn();
const updateField = vi.fn();

let signUpState: {
  form: { email: string; password: string; userName: string };
  updateField: typeof updateField;
  isLoading: boolean;
  result: { success: boolean; message: string } | null;
  submitForm: typeof submitForm;
};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/signup", state: null }),
}));

vi.mock("@/hooks/auth/useSignUp", () => ({
  useSignUp: () => signUpState,
}));

vi.mock("@/hooks/common/useCustomToast.ts", () => ({
  useCustomToast: () => ({ toast: mockToast }),
}));

describe("AuthSignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signUpState = {
      form: { email: "", password: "", userName: "" },
      updateField,
      isLoading: false,
      result: null,
      submitForm,
    };
  });

  it("이메일/비밀번호/이름 입력과 회원가입 버튼을 렌더링해야 한다", () => {
    render(<AuthSignUpForm />);

    expect(screen.getByPlaceholderText("이메일을 입력하세요")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호를 입력하세요")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("이름을 입력해주세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument();
  });

  it("이름 입력 시 updateField가 userName으로 호출되어야 한다", () => {
    render(<AuthSignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("이름을 입력해주세요"), { target: { value: "민석" } });

    expect(updateField).toHaveBeenCalledWith("userName", "민석");
  });

  it("폼 제출 시 submitForm이 호출되어야 한다", () => {
    render(<AuthSignUpForm />);

    fireEvent.submit(screen.getByRole("button", { name: "회원가입" }).closest("form")!);

    expect(submitForm).toHaveBeenCalledTimes(1);
  });

  it("isLoading이면 버튼이 '처리 중...'이고 비활성화되어야 한다", () => {
    signUpState.isLoading = true;
    render(<AuthSignUpForm />);

    expect(screen.getByRole("button", { name: "처리 중..." })).toBeDisabled();
  });

  it("회원가입 성공 시 성공 toast 후 /signin으로 이동해야 한다", () => {
    signUpState.result = { success: true, message: "메일을 확인하세요." };
    render(<AuthSignUpForm />);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "회원가입 성공" }));
    expect(mockNavigate).toHaveBeenCalledWith("/signin", expect.objectContaining({ state: { from: "/signup" } }));
  });

  it("회원가입 실패 시 destructive toast를 띄워야 한다", () => {
    signUpState.result = { success: false, message: "이미 가입된 이메일" };
    render(<AuthSignUpForm />);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "회원가입 실패", variant: "destructive" })
    );
  });
});
