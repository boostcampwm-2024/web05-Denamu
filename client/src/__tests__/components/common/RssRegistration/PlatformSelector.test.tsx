import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

vi.unmock("@/components/RssRegistration/PlatformSelector");

vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    Select: pass,
    SelectContent: pass,
    SelectItem: ({ children }: { children: React.ReactNode }) => <div role="option">{children}</div>,
    SelectTrigger: pass,
    SelectValue: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  };
});

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

import { BlogPlatformSelector } from "@/components/RssRegistration/PlatformSelector";

const platforms = [
  { value: "tistory", label: "Tistory" },
  { value: "velog", label: "Velog" },
];

describe("BlogPlatformSelector", () => {
  it("라벨과 플랫폼 옵션들을 렌더링해야 한다", () => {
    render(<BlogPlatformSelector platforms={platforms} value="" onChange={vi.fn()} />);

    expect(screen.getByText("블로그 플랫폼")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("값이 없으면 안내 문구를 표시해야 한다", () => {
    render(<BlogPlatformSelector platforms={platforms} value="" onChange={vi.fn()} />);

    expect(screen.getByText(/플랫폼 배지를 클릭/)).toBeInTheDocument();
  });

  it("값이 선택되면 해당 라벨을 표시하고 안내 문구를 숨겨야 한다", () => {
    render(<BlogPlatformSelector platforms={platforms} value="velog" onChange={vi.fn()} />);

    expect(screen.getAllByText("Velog").length).toBeGreaterThan(0);
    expect(screen.queryByText(/플랫폼 배지를 클릭/)).not.toBeInTheDocument();
  });
});
