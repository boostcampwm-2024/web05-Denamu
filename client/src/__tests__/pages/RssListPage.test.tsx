import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import RssListPage from "@/pages/RssListPage.tsx";

import { formatDate } from "@/utils/date";

import { RssSearchData, RssSearchResponse } from "@/types/search";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigateToRss = vi.fn();

let allRssState: { data: RssSearchResponse | undefined; isLoading: boolean; isError: boolean };

const useAllRssMock = vi.fn<
  (page: number, limit: number, blogPlatform?: string) => typeof allRssState
>(() => allRssState);

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock("react-helmet", () => ({
  Helmet: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/common/useNavigateToRss", () => ({
  useNavigateToRss: () => mockNavigateToRss,
}));

vi.mock("@/hooks/queries/useAllRss", () => ({
  useAllRss: (page: number, limit: number, blogPlatform?: string) => useAllRssMock(page, limit, blogPlatform),
}));

vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: ReactNode }) => <>{children}</>;
  return {
    Select: ({ children, onValueChange }: { children: ReactNode; onValueChange: (value: string) => void }) => (
      <div
        onClick={(event) => {
          const value = (event.target as HTMLElement).getAttribute("data-value");
          if (value) onValueChange(value);
        }}
      >
        {children}
      </div>
    ),
    SelectContent: pass,
    SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
      <div role="option" data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: ({ children }: { children: ReactNode }) => <div data-testid="platform-trigger">{children}</div>,
    SelectValue: pass,
  };
});

const makeData = (result: RssSearchData["result"], totalCount = result.length, totalPages = 1): RssSearchResponse => ({
  message: "성공",
  data: { result, totalCount, totalPages },
});

describe("RssListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    allRssState = { data: makeData([]), isLoading: false, isError: false };
  });

  it("로딩 중에는 로딩 문구를 보여준다", () => {
    allRssState = { data: undefined, isLoading: true, isError: false };

    render(<RssListPage />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 에러 문구를 보여준다", () => {
    allRssState = { data: undefined, isLoading: false, isError: true };

    render(<RssListPage />);

    expect(screen.getByText("RSS 목록을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("목록이 비어있으면 안내 문구를 보여준다", () => {
    render(<RssListPage />);

    expect(screen.getByText("등록된 RSS가 없습니다.")).toBeInTheDocument();
  });

  it("RSS 목록과 총 개수를 렌더링한다", () => {
    allRssState = {
      data: makeData(
        [{
          id: 1,
          name: "seok3765.log",
          blogPlatform: "velog",
          blogImage: null,
          feedCount: 12,
          lastPublishedAt: "2025-01-15T00:00:00.000Z",
        }],
        1,
        1
      ),
      isLoading: false,
      isError: false,
    };

    render(<RssListPage />);

    expect(screen.getByText("seok3765.log")).toBeInTheDocument();
    expect(screen.getByText("게시글 12개")).toBeInTheDocument();
    expect(screen.getByText("등록된 블로그 총 1개")).toBeInTheDocument();
    expect(
      screen.getByText(`최근 게시글 ${formatDate("2025-01-15T00:00:00.000Z")}`)
    ).toBeInTheDocument();
  });

  it("최근 게시글이 없으면 날짜 대신 '-'를 표시한다", () => {
    allRssState = {
      data: makeData(
        [{ id: 1, name: "seok3765.log", blogPlatform: "velog", blogImage: null, feedCount: 0, lastPublishedAt: null }],
        1,
        1
      ),
      isLoading: false,
      isError: false,
    };

    render(<RssListPage />);

    expect(screen.getByText("최근 게시글 -")).toBeInTheDocument();
  });

  it("카드를 클릭하면 해당 RSS로 이동한다", () => {
    allRssState = {
      data: makeData([{ id: 7, name: "seok3765.log", blogPlatform: "velog", blogImage: null, feedCount: 3, lastPublishedAt: null }], 1, 1),
      isLoading: false,
      isError: false,
    };

    render(<RssListPage />);

    fireEvent.click(screen.getByText("seok3765.log"));

    expect(mockNavigateToRss).toHaveBeenCalledWith(7);
  });

  it("페이지가 2개 이상이면 페이지네이션을 보여주고 다음 클릭 시 page를 올린다", () => {
    allRssState = {
      data: makeData([{ id: 1, name: "a", blogPlatform: "velog", blogImage: null, feedCount: 1, lastPublishedAt: null }], 2, 2),
      isLoading: false,
      isError: false,
    };

    render(<RssListPage />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(useAllRssMock).toHaveBeenLastCalledWith(2, 21, undefined);
  });

  it("초기 상태에서는 트리거에 '전체 플랫폼'이 표시된다", () => {
    render(<RssListPage />);

    expect(screen.getByTestId("platform-trigger")).toHaveTextContent("전체 플랫폼");
  });

  it("플랫폼 필터 선택 시 해당 플랫폼으로 조회하고, 트리거 표시와 페이지를 갱신한다", () => {
    render(<RssListPage />);

    expect(useAllRssMock).toHaveBeenLastCalledWith(1, 21, undefined);

    fireEvent.click(screen.getByRole("option", { name: /Velog/ }));

    expect(useAllRssMock).toHaveBeenLastCalledWith(1, 21, "velog");
    expect(screen.getByTestId("platform-trigger")).toHaveTextContent("Velog");
    expect(screen.getByText("Velog 블로그 총 0개")).toBeInTheDocument();
  });
});
