import { describe, expect, it } from "vitest";

import { AuthBanner } from "@/components/auth/AuthBanner.tsx";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("AuthBanner", () => {
  it("로고 이미지와 슬로건을 렌더링해야 한다", () => {
    render(
      <MemoryRouter>
        <AuthBanner />
      </MemoryRouter>
    );

    expect(screen.getByRole("img", { name: "Denamu" })).toBeInTheDocument();
    expect(screen.getByText("개발자들의 이야기가 자라나는 곳")).toBeInTheDocument();
  });

  it("location.state.from이 /signin이어도 동일한 콘텐츠를 렌더링해야 한다", () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/signup", state: { from: "/signin" } }]}>
        <AuthBanner />
      </MemoryRouter>
    );

    expect(screen.getByText("개발자들의 이야기가 자라나는 곳")).toBeInTheDocument();
  });
});
