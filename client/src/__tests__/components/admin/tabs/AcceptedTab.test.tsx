import { describe, expect, it, vi } from "vitest";

import AcceptedTab from "@/components/admin/tabs/AcceptedTab.tsx";

import { AdminRssData } from "@/types/rss.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/tabs", () => ({
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/admin/rss/RssResponseCard", () => ({
  RssResponseCard: ({ request }: { request: AdminRssData }) => <div data-testid="response-card">{request.name}</div>,
}));

describe("AcceptedTab", () => {
  it("data 개수만큼 RssResponseCard를 렌더링해야 한다", () => {
    const data = [
      { id: 1, name: "승인1" },
      { id: 2, name: "승인2" },
    ] as AdminRssData[];
    render(<AcceptedTab data={data} />);

    expect(screen.getAllByTestId("response-card")).toHaveLength(2);
  });

  it("빈 data면 카드를 렌더링하지 않아야 한다", () => {
    render(<AcceptedTab data={[]} />);

    expect(screen.queryByTestId("response-card")).not.toBeInTheDocument();
  });
});
