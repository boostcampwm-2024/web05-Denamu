import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { RssRequestCard } from "@/components/admin/rss/RssRequestCard.tsx";

import { AdminRssData } from "@/types/rss.ts";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

const request = {
  id: 1,
  name: "테크 블로그",
  rssUrl: "https://blog.test/rss",
  userName: "신청자명",
} as AdminRssData;

describe("RssRequestCard", () => {
  it("블로그명, URL, 신청자를 렌더링해야 한다", () => {
    render(<RssRequestCard request={request} onApprove={vi.fn()} onReject={vi.fn()} />);

    expect(screen.getByText("테크 블로그")).toBeInTheDocument();
    expect(screen.getByText("https://blog.test/rss")).toBeInTheDocument();
    expect(screen.getByText(/신청자명/)).toBeInTheDocument();
  });

  it("승인 클릭 시 onApprove(request)를 호출해야 한다", () => {
    const onApprove = vi.fn();
    render(<RssRequestCard request={request} onApprove={onApprove} onReject={vi.fn()} />);

    fireEvent.click(screen.getByTestId("lucide-CheckCircle").closest("button")!);

    expect(onApprove).toHaveBeenCalledWith(request);
  });

  it("거부 클릭 시 onReject(request)를 호출해야 한다", () => {
    const onReject = vi.fn();
    render(<RssRequestCard request={request} onApprove={vi.fn()} onReject={onReject} />);

    fireEvent.click(screen.getByTestId("lucide-XCircle").closest("button")!);

    expect(onReject).toHaveBeenCalledWith(request);
  });
});
