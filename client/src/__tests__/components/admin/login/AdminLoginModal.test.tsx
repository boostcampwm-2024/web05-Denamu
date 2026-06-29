import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminLogin from "@/components/admin/login/AdminLoginModal.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mutate = vi.fn();

vi.mock("@/hooks/common/useKeyboardShortcut", () => ({ useKeyboardShortcut: vi.fn() }));

vi.mock("@/hooks/queries/useAdminAuth", () => ({
  useAdminAuth: () => ({ mutate }),
  useAdminForgotPassword: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/components/RssRegistration/FormInput", () => ({
  FormInput: ({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <input data-testid={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  ),
}));

describe("AdminLogin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("관리자 로그인 폼을 렌더링해야 한다", () => {
    render(<AdminLogin setLogin={vi.fn()} />);

    expect(screen.getByText("관리자 로그인")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("이메일/비밀번호 입력 후 제출 시 mutate를 호출해야 한다", () => {
    render(<AdminLogin setLogin={vi.fn()} />);

    fireEvent.change(screen.getByTestId("email"), { target: { value: "admin@test.com" } });
    fireEvent.change(screen.getByTestId("password"), { target: { value: "pw1234" } });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(mutate).toHaveBeenCalledWith({ email: "admin@test.com", password: "pw1234" });
  });
});
