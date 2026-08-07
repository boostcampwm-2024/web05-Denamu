import { describe, expect, it, vi } from "vitest";

import { ReportDialog } from "@/components/common/ReportDialog";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return {
    Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange: (value: string) => void }) => (
      <div
        onClick={(event) => {
          const value = (event.target as HTMLElement).getAttribute("data-value");
          if (value) onValueChange(value);
        }}
      >
        {children}
      </div>
    ),
    SelectContent: pass,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <div role="option" data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: pass,
    SelectValue: () => null,
  };
});

const selectReason = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByText("스팸/광고"));
};

describe("ReportDialog", () => {
  it("사유를 선택하지 않으면 신고하기 버튼이 비활성화되어야 한다", () => {
    render(<ReportDialog open title="유저 신고" onSubmit={vi.fn()} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "신고하기" })).toBeDisabled();
  });

  it("사유를 선택하고 제출하면 onSubmit에 payload를 전달해야 한다", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReportDialog open title="유저 신고" onSubmit={handleSubmit} onOpenChange={vi.fn()} />);

    await selectReason(user);
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(handleSubmit).toHaveBeenCalledWith({ reason: "SPAM", detail: undefined });
  });

  it("상세 내용을 입력하면 onSubmit에 detail을 포함해 전달해야 한다", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReportDialog open title="유저 신고" onSubmit={handleSubmit} onOpenChange={vi.fn()} />);

    await selectReason(user);
    await user.type(screen.getByPlaceholderText("신고 사유에 대해 자세히 설명해주세요."), "반복 광고");
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(handleSubmit).toHaveBeenCalledWith({ reason: "SPAM", detail: "반복 광고" });
  });

  it("취소를 누르면 onOpenChange(false)를 호출해야 한다", async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<ReportDialog open title="유저 신고" onSubmit={vi.fn()} onOpenChange={handleOpenChange} />);

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
