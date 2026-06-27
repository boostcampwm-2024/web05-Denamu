import { describe, expect, it } from "vitest";

import { RssResponseCard } from "@/components/admin/rss/RssResponseCard.tsx";

import { AdminRssData } from "@/types/rss.ts";
import { render, screen } from "@testing-library/react";

describe("RssResponseCard", () => {
  it("블로그명, URL, 신청자를 렌더링해야 한다", () => {
    const request = { name: "응답 블로그", rssUrl: "https://r.test/rss", userName: "유저" } as AdminRssData;
    render(<RssResponseCard request={request} />);

    expect(screen.getByText("응답 블로그")).toBeInTheDocument();
    expect(screen.getByText("https://r.test/rss")).toBeInTheDocument();
    expect(screen.getByText(/유저/)).toBeInTheDocument();
  });

  it("description이 있으면 거부 사유를 표시해야 한다", () => {
    const request = {
      name: "B",
      rssUrl: "u",
      userName: "U",
      description: "중복된 블로그",
    } as AdminRssData;
    render(<RssResponseCard request={request} />);

    expect(screen.getByText(/거부 사유:중복된 블로그/)).toBeInTheDocument();
  });
});
