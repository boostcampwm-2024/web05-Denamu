import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { RssManagementTab } from "@/components/profile/rss/RssManagementTab.tsx";

import { CertifiedRss } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

let rssList: CertifiedRss[];
let isLoading: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/queries/useProfile.ts", () => ({ useCertifiedRss: () => ({ data: rssList, isLoading }) }));
vi.mock("@/hooks/queries/useRssCertification.ts", () => ({
  useDeleteRssCertification: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/components/profile/rss/OwnedRssCard.tsx", () => ({
  OwnedRssCard: ({ rss }: { rss: CertifiedRss }) => <li data-testid="owned-card">{rss.name}</li>,
}));
vi.mock("@/components/profile/rss/RssClaimModal.tsx", () => ({
  RssClaimModal: ({ open }: { open: boolean }) => (open ? <div data-testid="claim-modal" /> : null),
}));
vi.mock("@/components/profile/rss/RssEditModal.tsx", () => ({ RssEditModal: () => null }));

vi.mock("@/components/ui/alert-dialog.tsx", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (open ? <div>{children}</div> : null),
    AlertDialogContent: pass,
    AlertDialogHeader: pass,
    AlertDialogFooter: pass,
    AlertDialogTitle: pass,
    AlertDialogDescription: pass,
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  };
});

describe("RssManagementTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rssList = [];
    isLoading = false;
  });

  it("소유한 RSS가 없으면 안내 문구를 표시해야 한다", () => {
    render(<RssManagementTab userId={1} />);

    expect(screen.getByText("소유한 RSS가 없습니다. RSS 소유 등록을 통해 추가하세요.")).toBeInTheDocument();
  });

  it("rssList가 있으면 OwnedRssCard를 렌더링해야 한다", () => {
    rssList = [
      { id: 1, name: "내 블로그1" },
      { id: 2, name: "내 블로그2" },
    ] as CertifiedRss[];
    render(<RssManagementTab userId={1} />);

    expect(screen.getAllByTestId("owned-card")).toHaveLength(2);
  });

  it("'RSS 소유 등록' 클릭 시 RssClaimModal이 열려야 한다", () => {
    render(<RssManagementTab userId={1} />);

    expect(screen.queryByTestId("claim-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("RSS 소유 등록"));

    expect(screen.getByTestId("claim-modal")).toBeInTheDocument();
  });
});
