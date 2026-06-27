import { describe, expect, it, vi } from "vitest";

import CommentAction from "@/components/common/Card/detail/CommentAction.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const baseProps = {
  id: 7,
  canEdit: true,
  canDelete: true,
  handleModify: vi.fn(),
  onDelete: vi.fn(),
};

describe("CommentAction", () => {
  it("canEdit/canDelete가 true면 수정·삭제 버튼을 렌더링해야 한다", () => {
    render(<CommentAction {...baseProps} handleModify={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("canEdit이 false면 수정 버튼이 없어야 한다", () => {
    render(<CommentAction {...baseProps} canEdit={false} handleModify={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  });

  it("수정 클릭 시 handleModify(id)를 호출해야 한다", () => {
    const handleModify = vi.fn();
    render(<CommentAction {...baseProps} handleModify={handleModify} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(handleModify).toHaveBeenCalledWith(7);
  });

  it("삭제 클릭 시 확인 다이얼로그가 열려야 한다", () => {
    render(<CommentAction {...baseProps} handleModify={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.getByText("댓글 삭제")).toBeInTheDocument();
    expect(screen.getByText("댓글을 정말로 삭제하시겠습니까?")).toBeInTheDocument();
  });

  it("다이얼로그에서 확인 클릭 시 onDelete(id)를 호출하고 닫혀야 한다", () => {
    const onDelete = vi.fn();
    render(<CommentAction {...baseProps} handleModify={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onDelete).toHaveBeenCalledWith(7);
    expect(screen.queryByText("댓글 삭제")).not.toBeInTheDocument();
  });

  it("다이얼로그에서 취소 클릭 시 닫히고 onDelete를 호출하지 않아야 한다", () => {
    const onDelete = vi.fn();
    render(<CommentAction {...baseProps} handleModify={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByText("댓글 삭제")).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
