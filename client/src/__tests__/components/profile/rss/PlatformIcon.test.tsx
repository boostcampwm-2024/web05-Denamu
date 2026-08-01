import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("PlatformIcon", () => {
  it("알려진 플랫폼이면 아이콘 이미지를 렌더링해야 한다", () => {
    render(<PlatformIcon platform="tistory" />);

    const img = screen.getByRole("img", { name: "tistory" });
    expect(img).toHaveAttribute("src", expect.stringContaining("tistory-icon.svg"));
  });

  it("알 수 없는 플랫폼이면 Rss 아이콘을 렌더링해야 한다", () => {
    render(<PlatformIcon platform="unknown" />);

    expect(screen.getByTestId("lucide-Rss")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
