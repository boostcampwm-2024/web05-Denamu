import { describe, expect, it, vi } from "vitest";

import Layout from "@/components/layout/Layout.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("@/components/layout/Header", () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock("@/components/about/Footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

describe("Layout", () => {
  it("Header와 children을 main 영역에 렌더링해야 한다", () => {
    render(
      <Layout>
        <p>본문 콘텐츠</p>
      </Layout>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("본문 콘텐츠")).toBeInTheDocument();
  });

  it("footer prop이 없으면 Footer를 렌더링하지 않는다", () => {
    render(
      <Layout>
        <p>본문 콘텐츠</p>
      </Layout>
    );

    expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
  });

  it("footer prop이 true면 Footer를 렌더링한다", () => {
    render(
      <Layout footer>
        <p>본문 콘텐츠</p>
      </Layout>
    );

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
