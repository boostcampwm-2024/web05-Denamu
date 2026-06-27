import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { Footer } from "@/components/about/Footer.tsx";

import { footerLinks, teamMembers } from "@/constants/footer.ts";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("Footer", () => {
  it("footerLinks의 label과 value, href가 렌더링되어야 한다", () => {
    render(<Footer />);

    footerLinks.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
      expect(screen.getByText(link.value)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: new RegExp(link.label) })).toHaveAttribute("href", link.href);
    });
  });

  it("subLinks가 렌더링되어야 한다", () => {
    render(<Footer />);

    const subLinks = footerLinks.flatMap((l) => l.subLinks ?? []);
    subLinks.forEach((sub) => {
      expect(screen.getByRole("link", { name: sub.label })).toHaveAttribute("href", sub.href);
    });
  });

  it("모든 팀 멤버 이름이 렌더링되어야 한다", () => {
    const { container } = render(<Footer />);

    teamMembers.forEach((name) => {
      expect(container).toHaveTextContent(name);
    });
  });
});
