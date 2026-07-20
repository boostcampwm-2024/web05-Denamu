import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { Footer } from "@/components/about/Footer.tsx";

import { footerLinks, teamMembers } from "@/constants/footer.ts";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("lucide-react", () => lucideProxy());

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

describe("Footer", () => {
  it("footerLinks의 label과 value, href가 렌더링되어야 한다", () => {
    renderFooter();

    footerLinks.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
      expect(screen.getByText(link.value)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: new RegExp(link.label) })).toHaveAttribute("href", link.href);
    });
  });

  it("subLinks가 렌더링되어야 한다", () => {
    renderFooter();

    const subLinks = footerLinks.flatMap((l) => l.subLinks ?? []);
    subLinks.forEach((sub) => {
      expect(screen.getByRole("link", { name: sub.label })).toHaveAttribute("href", sub.href);
    });
  });

  it("모든 팀 멤버 이름이 렌더링되어야 한다", () => {
    const { container } = renderFooter();

    teamMembers.forEach((name) => {
      expect(container).toHaveTextContent(name);
    });
  });

  it("개인정보처리방침 링크가 /privacy 로 연결되어야 한다", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "개인정보처리방침" })).toHaveAttribute("href", "/privacy");
  });
});
