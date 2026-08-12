import { describe, expect, it, vi } from "vitest";

import { BlockConfirmDialog } from "@/components/common/BlockConfirmDialog";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const ownedRss = [
  {
    id: 10,
    name: "seok.log",
    userName: "u",
    rssUrl: "",
    blogPlatform: "velog",
    feedCount: 3,
    subscriberCount: 1,
    isSubscribed: false,
    blogImage: null,
    suspensionCount: 0,
  },
];

describe("BlockConfirmDialog", () => {
  it("owner와 ownedRss가 없으면 차단 확인만 요청하고 onConfirm에 빈 값을 전달해야 한다", async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <BlockConfirmDialog open title="유저를 차단하시겠습니까?" onOpenChange={vi.fn()} onConfirm={handleConfirm} />
    );

    expect(screen.queryByText("해당 유저가 소유중인 RSS 차단")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "차단" }));

    expect(handleConfirm).toHaveBeenCalledWith({ blockOwner: false, rssIds: [] });
  });

  it("ownedRss가 있으면 목록을 표시하고 선택한 rssIds를 전달해야 한다", async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <BlockConfirmDialog
        open
        title="RSS를 차단하시겠습니까?"
        ownedRss={ownedRss}
        onOpenChange={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText("해당 유저가 소유중인 RSS 차단")).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "seok.log 차단" }));
    await user.click(screen.getByRole("button", { name: "차단" }));

    expect(handleConfirm).toHaveBeenCalledWith({ blockOwner: false, rssIds: [10] });
  });

  it("owner가 있으면 유저 차단 행을 표시하고 켜면 blockOwner=true를 전달해야 한다", async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <BlockConfirmDialog
        open
        title="RSS를 차단하시겠습니까?"
        owner={{ id: 1, userName: "김개발" }}
        onOpenChange={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    await user.click(screen.getByRole("switch", { name: "김개발 유저도 차단" }));
    await user.click(screen.getByRole("button", { name: "차단" }));

    expect(handleConfirm).toHaveBeenCalledWith({ blockOwner: true, rssIds: [] });
  });

  it("취소를 누르면 onOpenChange(false)를 호출하고 onConfirm은 호출하지 않아야 한다", async () => {
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <BlockConfirmDialog
        open
        title="RSS를 차단하시겠습니까?"
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
