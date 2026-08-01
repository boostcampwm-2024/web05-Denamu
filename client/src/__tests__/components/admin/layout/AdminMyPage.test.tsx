import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import AdminMyPage from "@/components/admin/layout/AdminMyPage.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const updateProfile = vi.fn();
const withdraw = vi.fn();
let checkData: { email: string; name: string; parent: { name: string } | null; emailNotification: boolean } | undefined;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useAdminAuth", () => ({
  useAdminCheck: () => ({ data: checkData }),
  useAdminUpdate: () => ({ mutate: updateProfile, isPending: false }),
  useAdminWithdraw: () => ({ mutate: withdraw, isPending: false }),
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

describe("AdminMyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    checkData = { email: "admin@test.com", name: "관리자", parent: null, emailNotification: true };
  });

  it("data가 없으면 아무것도 렌더링하지 않아야 한다", () => {
    checkData = undefined;
    const { container } = render(<AdminMyPage onBack={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("이메일과 이름을 렌더링해야 한다", () => {
    render(<AdminMyPage onBack={vi.fn()} />);

    expect(screen.getByDisplayValue("admin@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("관리자")).toBeInTheDocument();
  });

  it("뒤로가기 클릭 시 onBack을 호출해야 한다", () => {
    const onBack = vi.fn();
    render(<AdminMyPage onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: /뒤로가기/ }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("수정하기 클릭 후 수정 완료 시 updateProfile을 호출해야 한다", () => {
    render(<AdminMyPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "수정하기" }));
    fireEvent.click(screen.getByRole("button", { name: "수정 완료" }));

    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ name: "관리자" }));
  });
});
