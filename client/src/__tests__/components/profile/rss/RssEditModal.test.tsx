import { beforeEach, describe, expect, it, vi } from "vitest";

import { RssEditModal } from "@/components/profile/rss/RssEditModal.tsx";

import { CertifiedRss } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const updateMutate = vi.fn();

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/queries/useRssCertification.ts", () => ({
  useUpdateRssCertification: () => ({ mutate: updateMutate, isPending: false }),
}));

const target = { id: 7, name: "기존 블로그", userName: "기존 신청자" } as CertifiedRss;

describe("RssEditModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("target이 있으면 기존 값으로 입력 필드를 채워야 한다", () => {
    render(<RssEditModal target={target} userId={1} onClose={vi.fn()} />);

    expect(screen.getByDisplayValue("기존 블로그")).toBeInTheDocument();
    expect(screen.getByDisplayValue("기존 신청자")).toBeInTheDocument();
  });

  it("target이 null이면 닫혀 있어야 한다", () => {
    render(<RssEditModal target={null} userId={1} onClose={vi.fn()} />);

    expect(screen.queryByText("RSS 정보 수정")).not.toBeInTheDocument();
  });

  it("저장 클릭 시 updateMutation.mutate를 호출해야 한다", () => {
    render(<RssEditModal target={target} userId={1} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(updateMutate).toHaveBeenCalledWith(
      { id: 7, name: "기존 블로그", userName: "기존 신청자" },
      expect.any(Object)
    );
  });

  it("취소 클릭 시 onClose를 호출해야 한다", () => {
    const onClose = vi.fn();
    render(<RssEditModal target={target} userId={1} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
