import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { AdminTabs } from "@/components/admin/layout/AdminTabs.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

let searchParam: string;
let pending: { data: { data: unknown[] }; isLoading: boolean; error: unknown; refetchData: () => void };
let accepted: typeof pending;
let rejected: typeof pending;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useSearchStore", () => ({ useAdminSearchStore: () => ({ searchParam }) }));
vi.mock("@/hooks/queries/useFetchRss", () => ({
  useFetchRss: () => pending,
  useFetchAccept: () => accepted,
  useFetchReject: () => rejected,
}));
const acceptMutate = vi.fn();
const rejectMutate = vi.fn();
vi.mock("@/hooks/queries/useRssActions", () => ({
  useAdminAccept: () => ({ mutate: acceptMutate }),
  useAdminReject: () => ({ mutate: rejectMutate }),
}));

vi.mock("@/components/ui/tabs", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Tabs: pass, TabsList: pass, TabsTrigger: pass };
});
vi.mock("@/components/ui/alert", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Alert: pass, AlertTitle: pass, AlertDescription: pass };
});

vi.mock("@/components/admin/tabs/PendingTab", () => ({
  default: ({ data, onApprove, onReject }: { data: Array<{ id: number; name: string }>; onApprove: (r: unknown) => void; onReject: (r: unknown) => void }) => (
    <div data-testid="pending-tab">
      {data.length}
      {data[0] && <button data-testid="approve" onClick={() => onApprove(data[0])} />}
      {data[0] && <button data-testid="reject" onClick={() => onReject(data[0])} />}
    </div>
  ),
}));
vi.mock("@/components/admin/tabs/AcceptedTab", () => ({
  default: ({ data }: { data: unknown[] }) => <div data-testid="accepted-tab">{data.length}</div>,
}));
vi.mock("@/components/admin/tabs/RejectedTab", () => ({
  default: ({ data }: { data: unknown[] }) => <div data-testid="rejected-tab">{data.length}</div>,
}));
vi.mock("@/components/admin/rss/RejectModal", () => ({
  RejectModal: ({ blogName, onSubmit }: { blogName?: string; onSubmit: () => void }) =>
    blogName ? (
      <div data-testid="reject-modal">
        {blogName}
        <button data-testid="reject-submit" onClick={onSubmit} />
      </div>
    ) : null,
}));

const makeState = (data: unknown[]) => ({ data: { data }, isLoading: false, error: null, refetchData: vi.fn() });

describe("AdminTabs", () => {
  beforeEach(() => {
    searchParam = "";
    pending = makeState([{ id: 1, name: "리액트 블로그", userName: "kim", rssUrl: "u1" }]);
    accepted = makeState([{ id: 2, name: "승인블로그", userName: "lee", rssUrl: "u2" }]);
    rejected = makeState([]);
  });

  it("로딩 중이면 Loading을 표시해야 한다", () => {
    pending.isLoading = true;
    render(<AdminTabs setLogout={vi.fn()} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("에러가 있으면 세션 만료 안내와 확인 버튼을 표시하고 setLogout을 호출해야 한다", () => {
    pending.error = new Error("expired");
    const setLogout = vi.fn();
    render(<AdminTabs setLogout={setLogout} />);

    expect(screen.getByText("세션이 만료되었습니다!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(setLogout).toHaveBeenCalledTimes(1);
  });

  it("정상 데이터면 각 탭에 데이터 개수를 전달해야 한다", () => {
    render(<AdminTabs setLogout={vi.fn()} />);

    expect(screen.getByTestId("pending-tab")).toHaveTextContent("1");
    expect(screen.getByTestId("accepted-tab")).toHaveTextContent("1");
    expect(screen.getByTestId("rejected-tab")).toHaveTextContent("0");
  });

  it("searchParam이 있으면 이름으로 필터링해야 한다", () => {
    searchParam = "리액트";
    render(<AdminTabs setLogout={vi.fn()} />);

    expect(screen.getByTestId("pending-tab")).toHaveTextContent("1");
    expect(screen.getByTestId("accepted-tab")).toHaveTextContent("0");
  });

  it("승인 시 acceptMutate 를 호출해야 한다", () => {
    render(<AdminTabs setLogout={vi.fn()} />);

    fireEvent.click(screen.getByTestId("approve"));

    expect(acceptMutate).toHaveBeenCalled();
  });

  it("거부 시 RejectModal 이 열리고 제출하면 rejectMutate 를 호출해야 한다", () => {
    render(<AdminTabs setLogout={vi.fn()} />);

    expect(screen.queryByTestId("reject-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("reject"));

    expect(screen.getByTestId("reject-modal")).toHaveTextContent("리액트 블로그");
    fireEvent.click(screen.getByTestId("reject-submit"));

    expect(rejectMutate).toHaveBeenCalled();
  });
});
