import { describe, expect, it, vi } from "vitest";

import { CertifiedRssList } from "@/components/profile/CertifiedRssList.tsx";

import { CertifiedRss } from "@/types/profile.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/profile/rss/CertifiedRssCard.tsx", () => ({
  CertifiedRssCard: ({ rss }: { rss: CertifiedRss }) => <li data-testid="rss-card">{rss.name}</li>,
}));

describe("CertifiedRssList", () => {
  it("rssList가 비어있으면 안내 문구를 표시해야 한다", () => {
    render(<CertifiedRssList userId={1} rssList={[]} isOwner />);

    expect(screen.getByText("인증된 RSS가 없습니다.")).toBeInTheDocument();
  });

  it("rssList가 있으면 CertifiedRssCard를 렌더링해야 한다", () => {
    const rssList = [
      { id: 1, name: "블로그A" },
      { id: 2, name: "블로그B" },
    ] as CertifiedRss[];
    render(<CertifiedRssList userId={1} rssList={rssList} isOwner />);

    expect(screen.getAllByTestId("rss-card")).toHaveLength(2);
  });
});
