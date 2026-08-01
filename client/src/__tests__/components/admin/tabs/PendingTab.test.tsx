import { describe, expect, it, vi } from "vitest";

import PendingTab from "@/components/admin/tabs/PendingTab.tsx";

import { AdminRssData } from "@/types/rss.ts";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/ui/tabs", () => ({
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/admin/rss/RssRequestCard", () => ({
  RssRequestCard: ({ request, onApprove, onReject }: { request: AdminRssData; onApprove: () => void; onReject: () => void }) => (
    <div data-testid="request-card">
      <span>{request.name}</span>
      <button data-testid={`approve-${request.id}`} onClick={onApprove} />
      <button data-testid={`reject-${request.id}`} onClick={onReject} />
    </div>
  ),
}));

const data = [
  { id: 1, name: "블로그1", rssUrl: "u1", userName: "a" },
  { id: 2, name: "블로그2", rssUrl: "u2", userName: "b" },
] as AdminRssData[];

describe("PendingTab", () => {
  it("data 개수만큼 RssRequestCard를 렌더링해야 한다", () => {
    render(<PendingTab data={data} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getAllByTestId("request-card")).toHaveLength(2);
  });

  it("승인 클릭 시 해당 request로 onApprove를 호출해야 한다", () => {
    const onApprove = vi.fn();
    render(<PendingTab data={data} onApprove={onApprove} onReject={vi.fn()} />);

    fireEvent.click(screen.getByTestId("approve-1"));

    expect(onApprove).toHaveBeenCalledWith(data[0]);
  });

  it("거부 클릭 시 해당 request로 onReject를 호출해야 한다", () => {
    const onReject = vi.fn();
    render(<PendingTab data={data} onApprove={vi.fn()} onReject={onReject} />);

    fireEvent.click(screen.getByTestId("reject-2"));

    expect(onReject).toHaveBeenCalledWith(data[1]);
  });
});
