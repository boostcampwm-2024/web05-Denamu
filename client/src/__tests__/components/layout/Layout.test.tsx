import { describe, expect, it, vi } from "vitest";

import Layout from "@/components/layout/Layout.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("@/components/layout/Header", () => ({
  default: () => <header data-testid="header" />,
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
});
