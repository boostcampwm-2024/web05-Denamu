import { describe, expect, it, vi } from "vitest";

import { AuthSocialLoginButtons } from "@/components/auth/AuthSocialLoginButtons.tsx";

import { nav } from "@/utils/redirect.ts";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/utils/redirect.ts", () => ({
  nav: { redirect: vi.fn() },
}));

describe("AuthSocialLoginButtons", () => {
  it("Github/Google 로그인 버튼을 렌더링해야 한다", () => {
    render(<AuthSocialLoginButtons />);

    expect(screen.getByTestId("oauth-github-button")).toBeInTheDocument();
    expect(screen.getByTestId("oauth-google-button")).toBeInTheDocument();
    expect(screen.getByText("Github로 계속하기")).toBeInTheDocument();
    expect(screen.getByText("Google로 계속하기")).toBeInTheDocument();
  });

  it("Github 버튼 클릭 시 type=github로 redirect해야 한다", () => {
    render(<AuthSocialLoginButtons />);

    fireEvent.click(screen.getByTestId("oauth-github-button"));

    expect(nav.redirect).toHaveBeenCalledWith(expect.stringContaining("type=github"));
  });

  it("Google 버튼 클릭 시 type=google로 redirect해야 한다", () => {
    render(<AuthSocialLoginButtons />);

    fireEvent.click(screen.getByTestId("oauth-google-button"));

    expect(nav.redirect).toHaveBeenCalledWith(expect.stringContaining("type=google"));
  });
});
