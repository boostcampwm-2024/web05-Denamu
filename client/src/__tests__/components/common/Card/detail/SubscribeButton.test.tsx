import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const navigate = vi.fn();
const toast = vi.fn();
let isAuthenticated: boolean;
let toggleState: { mutate: ReturnType<typeof vi.fn>; isPending: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast }) }));

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  useToggleSubscription: () => toggleState,
}));

vi.mock("@/store/useAuthStore.ts", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated }),
}));

describe("SubscribeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAuthenticated = true;
    toggleState = { mutate: vi.fn(), isPending: false };
  });

  it("미구독이면 '구독', 구독 중이면 '구독 중'을 표시해야 한다", () => {
    const { rerender } = render(<SubscribeButton rssId={1} isSubscribed={false} />);
    expect(screen.getByRole("button")).toHaveTextContent("구독");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");

    rerender(<SubscribeButton rssId={1} isSubscribed={true} />);
    expect(screen.getByRole("button")).toHaveTextContent("구독 중");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("비로그인 상태에서 클릭하면 로그인 안내 후 로그인 페이지로 이동하고 mutate를 호출하지 않아야 한다", () => {
    isAuthenticated = false;
    render(<SubscribeButton rssId={1} isSubscribed={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "로그인이 필요합니다" }));
    expect(navigate).toHaveBeenCalledWith("/signin");
    expect(toggleState.mutate).not.toHaveBeenCalled();
  });

  it("로그인 상태에서 클릭하면 낙관적으로 상태를 토글하고 직전 구독 상태로 mutate를 호출해야 한다", () => {
    render(<SubscribeButton rssId={7} isSubscribed={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("구독 중");
    expect(toggleState.mutate).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it("mutate 실패 시 이전 상태로 롤백하고 실패 토스트를 띄워야 한다", () => {
    toggleState.mutate.mockImplementation((_prev, opts) => opts.onError());
    render(<SubscribeButton rssId={7} isSubscribed={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("구독");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "요청 실패" }));
  });

  it("요청 진행 중이면 버튼이 비활성화되고 클릭해도 mutate를 호출하지 않아야 한다", () => {
    toggleState.isPending = true;
    render(<SubscribeButton rssId={7} isSubscribed={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(toggleState.mutate).not.toHaveBeenCalled();
  });
});
