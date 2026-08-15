import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { LogoutButton } from "@/components/layout/sidebar/LogoutButton.tsx";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const logout = vi.fn();
let authState: { isAuthenticated: boolean; logout: typeof logout };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { isAuthenticated: false, logout };
  });

  it("비인증 상태에서는 아무것도 렌더링하지 않아야 한다", () => {
    const { container } = render(<LogoutButton />);

    expect(container).toBeEmptyDOMElement();
  });

  it("인증 상태에서는 빨간색 로그아웃 텍스트 버튼을 렌더링해야 한다", () => {
    authState.isAuthenticated = true;
    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: /로그아웃/ })).toHaveClass("text-red-500");
  });

  it("클릭 시 logout 후 페이지를 새로고침해야 한다", async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });
    authState.isAuthenticated = true;
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: /로그아웃/ }));

    expect(logout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(reloadMock).toHaveBeenCalledTimes(1));
  });
});
