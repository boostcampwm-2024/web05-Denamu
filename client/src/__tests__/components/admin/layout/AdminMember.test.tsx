import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import AdminMember from "@/components/admin/layout/AdminMember.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const registerMutate = vi.fn();
const deleteChild = vi.fn();
let children: Array<{ id: number; name: string; email: string }> | undefined;
let isChildrenLoading: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useAdminAuth", () => ({
  useAdminRegister: () => ({ mutate: registerMutate }),
  useAdminChildren: () => ({ data: children, isLoading: isChildrenLoading }),
  useAdminChildDelete: () => ({ mutate: deleteChild }),
}));

vi.mock("@/components/ui/alert-dialog", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    AlertDialog: pass,
    AlertDialogContent: pass,
    AlertDialogHeader: pass,
    AlertDialogFooter: pass,
    AlertDialogTitle: pass,
    AlertDialogDescription: pass,
    AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  };
});

describe("AdminMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    children = [];
    isChildrenLoading = false;
  });

  it("관리자 계정 생성 폼을 렌더링해야 한다", () => {
    render(<AdminMember />);

    expect(screen.getByText("관리자 계정 생성")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "가입" })).toBeInTheDocument();
  });

  it("폼 입력 후 제출 시 mutate를 호출해야 한다", () => {
    render(<AdminMember />);

    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "새관리자" } });
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw1234" } });
    fireEvent.click(screen.getByRole("button", { name: "가입" }));

    expect(registerMutate).toHaveBeenCalledWith({ name: "새관리자", email: "new@test.com", password: "pw1234" });
  });

  it("생성한 계정이 없으면 안내 문구를 표시해야 한다", () => {
    render(<AdminMember />);

    expect(screen.getByText("생성한 계정이 없습니다.")).toBeInTheDocument();
  });

  it("자식 계정 목록을 렌더링하고 삭제 시 deleteChild(id)를 호출해야 한다", () => {
    children = [{ id: 5, name: "자식1", email: "child@test.com" }];
    render(<AdminMember />);

    expect(screen.getAllByText("자식1").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(deleteChild).toHaveBeenCalledWith(5);
  });
});
