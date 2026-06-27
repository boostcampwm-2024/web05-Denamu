import { describe, expect, it, vi } from "vitest";

import RejectedTab from "@/components/admin/tabs/RejectedTab.tsx";

import { AdminRssData } from "@/types/rss.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/tabs", () => ({
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/admin/rss/RssResponseCard", () => ({
  RssResponseCard: ({ request }: { request: AdminRssData }) => <div data-testid="response-card">{request.name}</div>,
}));

describe("RejectedTab", () => {
  it("data 개수만큼 RssResponseCard를 렌더링해야 한다", () => {
    const data = [{ id: 1, name: "거부1" }] as AdminRssData[];
    render(<RejectedTab data={data} />);

    expect(screen.getAllByTestId("response-card")).toHaveLength(1);
  });
});
