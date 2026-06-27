import { describe, expect, it } from "vitest";

import { LikedPosts } from "@/components/profile/sections/LikedPosts.tsx";

import { render, screen } from "@testing-library/react";

describe("Profile LikedPosts", () => {
  it("'좋아요한 목록' 섹션을 렌더링해야 한다", () => {
    render(<LikedPosts />);

    expect(screen.getByText("좋아요한 목록")).toBeInTheDocument();
  });
});
