import { describe, expect, it } from "vitest";

import { Section } from "@/components/profile/common/Section.tsx";

import { render, screen } from "@testing-library/react";

describe("Profile Section", () => {
  it("title과 개발 중 안내 문구를 렌더링해야 한다", () => {
    render(<Section title="좋아요한 글" />);

    expect(screen.getByText("좋아요한 글")).toBeInTheDocument();
    expect(screen.getByText("서비스가 현재 개발 중입니다. 곧 만나요!")).toBeInTheDocument();
  });
});
