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
  it("withBlockOption이 없으면 차단 스위치를 표시하지 않아야 한다", () => {
    render(<ReportDialog open title="유저 신고" onSubmit={vi.fn()} onOpenChange={vi.fn()} />);

    expect(screen.queryByText("이 유저도 함께 차단하기")).not.toBeInTheDocument();
  });

  it("withBlockOption이 있으면 차단 스위치를 표시하고 기본값은 꺼짐이어야 한다", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReportDialog open withBlockOption title="유저 신고" onSubmit={handleSubmit} onOpenChange={vi.fn()} />);

    await selectReason(user);
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(handleSubmit).toHaveBeenCalledWith({ reason: "SPAM", detail: undefined }, false);
  });

  it("차단 스위치를 켜면 onSubmit에 blockToo=true를 전달해야 한다", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReportDialog open withBlockOption title="유저 신고" onSubmit={handleSubmit} onOpenChange={vi.fn()} />);

    await selectReason(user);
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(handleSubmit).toHaveBeenCalledWith({ reason: "SPAM", detail: undefined }, true);
  });
});
