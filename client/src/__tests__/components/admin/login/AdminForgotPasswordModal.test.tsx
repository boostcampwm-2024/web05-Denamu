import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminForgotPasswordModal from "@/components/admin/login/AdminForgotPasswordModal";

import { fireEvent, render, screen } from "@testing-library/react";

const mutate = vi.fn();

vi.mock("@/hooks/queries/useAdminAuth", () => ({
  useAdminForgotPassword: () => ({ mutate, isPending: false }),
}));

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/RssRegistration/FormInput", () => ({
  FormInput: ({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <input data-testid={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  ),
}));

describe("AdminForgotPasswordModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("열린 상태에서 비밀번호 찾기 폼을 렌더링해야 한다", () => {
    render(<AdminForgotPasswordModal open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("비밀번호 찾기")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "재설정 링크 받기" })).toBeInTheDocument();
  });

  it("이메일 입력 후 제출 시 mutate를 호출해야 한다", () => {
    render(<AdminForgotPasswordModal open={true} onOpenChange={vi.fn()} />);

    fireEvent.change(screen.getByTestId("forgot-email"), { target: { value: "admin@test.com" } });
    fireEvent.click(screen.getByRole("button", { name: "재설정 링크 받기" }));

    expect(mutate).toHaveBeenCalledWith({ email: "admin@test.com" });
  });

  it("이메일이 비어 있으면 mutate를 호출하지 않아야 한다", () => {
    render(<AdminForgotPasswordModal open={true} onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "재설정 링크 받기" }));

    expect(mutate).not.toHaveBeenCalled();
  });
});
