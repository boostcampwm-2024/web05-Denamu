import { describe, expect, it, vi } from "vitest";

import { RejectModal } from "@/components/admin/rss/RejectModal.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const baseProps = {
  blogName: "테스트 블로그",
  rejectMessage: "",
  handleReason: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
};

describe("RejectModal", () => {
  it("blogName이 있으면 다이얼로그와 블로그명을 표시해야 한다", () => {
    render(<RejectModal {...baseProps} handleReason={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText("거부 사유 입력")).toBeInTheDocument();
    expect(screen.getByText(/테스트 블로그/)).toBeInTheDocument();
  });

  it("blogName이 없으면 다이얼로그가 닫혀 있어야 한다", () => {
    render(<RejectModal {...baseProps} blogName={undefined} handleReason={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByText("거부 사유 입력")).not.toBeInTheDocument();
  });

  it("사유 입력 시 handleReason을 호출해야 한다", () => {
    const handleReason = vi.fn();
    render(<RejectModal {...baseProps} handleReason={handleReason} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("거부 사유를 입력하세요..."), { target: { value: "부적절" } });

    expect(handleReason).toHaveBeenCalledWith("부적절");
  });

  it("사유가 비어있으면 거부하기 버튼이 비활성화되어야 한다", () => {
    render(<RejectModal {...baseProps} rejectMessage="" handleReason={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "거부하기" })).toBeDisabled();
  });

  it("사유가 있을 때 거부하기 클릭 시 onSubmit과 onCancel을 호출해야 한다", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<RejectModal {...baseProps} rejectMessage="사유" handleReason={vi.fn()} onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "거부하기" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("취소 클릭 시 onCancel을 호출해야 한다", () => {
    const onCancel = vi.fn();
    render(<RejectModal {...baseProps} handleReason={vi.fn()} onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
