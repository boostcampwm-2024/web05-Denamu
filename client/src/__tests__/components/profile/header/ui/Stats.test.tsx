import { describe, expect, it } from "vitest";

import { Stats } from "@/components/profile/header/ui/Stats.tsx";

import { render, screen } from "@testing-library/react";

describe("Profile Stats", () => {
  it("총 포스팅/월간 조회수/관심 토픽 수를 렌더링해야 한다", () => {
    render(<Stats totalPosts={12} totalViews={12345} topicsCount={3} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("총 포스팅")).toBeInTheDocument();
    expect(screen.getByText("월간 조회수")).toBeInTheDocument();
    expect(screen.getByText("관심 토픽")).toBeInTheDocument();
  });
});
