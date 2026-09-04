import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

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

  it("image가 주어지면 해당 이미지를 렌더링해야 한다", () => {
    render(<PlatformIcon platform="naver" image="https://blog.naver.com/profile.png" />);

    const img = screen.getByRole("img", { name: "naver" });
    expect(img).toHaveAttribute("src", "https://blog.naver.com/profile.png");
  });

  it("image 로드에 실패하면 플랫폼 아이콘으로 대체해야 한다", () => {
    render(<PlatformIcon platform="naver" image="https://blog.naver.com/profile.png" />);

    const img = screen.getByRole("img", { name: "naver" });
    fireEvent.error(img);

    expect(img).toHaveAttribute("src", expect.stringContaining("naver-icon.svg"));
  });

  it("알 수 없는 플랫폼이고 name이 주어지면 이니셜을 렌더링해야 한다", () => {
    render(<PlatformIcon platform="etc" name="데나무 블로그" />);

    expect(screen.getByText("데나")).toBeInTheDocument();
    expect(screen.queryByTestId("lucide-Rss")).not.toBeInTheDocument();
  });
});
