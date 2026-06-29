import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import LikeButton from "@/components/common/Card/detail/LikeButton.tsx";

import { FeedDetail } from "@/types/post.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const toggleLike = vi.fn();
let isAuthenticated: boolean;
let isLike: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: false }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) => selector({ isAuthenticated }),
}));

vi.mock("@/hooks/queries/useLike", () => ({
  useLikeStatus: () => ({ data: isLike }),
  useToggleLike: () => ({ mutate: toggleLike, isPending: false }),
}));

vi.mock("@/components/auth/AuthSignInForm", () => ({
  AuthSignInForm: () => <div data-testid="signin-form" />,
}));

const post = { id: 1, likes: 5 } as FeedDetail;

describe("LikeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAuthenticated = true;
    isLike = false;
  });

  it("좋아요 수를 렌더링해야 한다", () => {
    render(<LikeButton post={post} />);

    expect(screen.getByRole("button", { name: /좋아요 5/ })).toBeInTheDocument();
  });

  it("인증 상태에서 클릭 시 현재 좋아요 상태로 toggleLike를 호출해야 한다", () => {
    isLike = true;
    render(<LikeButton post={post} />);

    fireEvent.click(screen.getByRole("button", { name: /좋아요/ }));

    expect(toggleLike).toHaveBeenCalledWith(true);
  });

  it("비인증 상태에서 클릭 시 toggleLike를 호출하지 않아야 한다", () => {
    isAuthenticated = false;
    render(<LikeButton post={post} />);

    fireEvent.click(screen.getByRole("button", { name: /좋아요/ }));

    expect(toggleLike).not.toHaveBeenCalled();
  });
});
