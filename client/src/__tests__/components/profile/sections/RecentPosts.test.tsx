import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { RecentPosts } from "@/components/profile/sections/RecentPosts.tsx";

import { User } from "@/types/profile.ts";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("Profile RecentPosts", () => {
  it("rssRegistered가 아니면 RSS 등록 유도 화면을 렌더링해야 한다", () => {
    render(<RecentPosts user={{ rssRegistered: false } as User} />);

    expect(screen.getByText("RSS 피드를 등록해보세요!")).toBeInTheDocument();
    expect(screen.getByText("RSS 등록하기")).toBeInTheDocument();
  });

  it("rssRegistered면 '최근 작성한 글' 섹션을 렌더링해야 한다", () => {
    render(<RecentPosts user={{ rssRegistered: true } as User} />);

    expect(screen.getByText("최근 작성한 글")).toBeInTheDocument();
  });
});
