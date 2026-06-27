import { describe, expect, it, vi } from "vitest";

import Alert from "@/components/common/Alert.tsx";

import { AlertType } from "@/types/alert.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const openAlert: AlertType = { isOpen: true, title: "삭제 확인", content: "정말 삭제하시겠습니까?" };

describe("Alert", () => {
  it("열린 상태에서 title과 content를 렌더링해야 한다", () => {
    render(<Alert alertOpen={openAlert} onClose={vi.fn()} />);

    expect(screen.getByText("삭제 확인")).toBeInTheDocument();
    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();
  });

  it("'확인' 클릭 시 onClose를 호출해야 한다", () => {
    const onClose = vi.fn();
    render(<Alert alertOpen={openAlert} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("닫힌 상태에서는 내용이 렌더링되지 않아야 한다", () => {
    render(<Alert alertOpen={{ isOpen: false, title: "x", content: "y" }} onClose={vi.fn()} />);

    expect(screen.queryByText("x")).not.toBeInTheDocument();
  });
});
