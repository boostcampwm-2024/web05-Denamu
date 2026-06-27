import { describe, expect, it } from "vitest";

import PostTag from "@/components/common/Card/PostTag.tsx";

import { render, screen } from "@testing-library/react";

describe("PostTag", () => {
  it("태그가 2개 이하면 모두 렌더링해야 한다", () => {
    render(<PostTag tags={["React", "TypeScript"]} />);

    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument();
  });

  it("태그가 3개 이상이면 앞 2개와 '+N' 표시를 렌더링해야 한다", () => {
    render(<PostTag tags={["React", "TypeScript", "Vitest", "Jest"]} />);

    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("3개 이상일 때 나머지 태그는 초기에는 보이지 않아야 한다", () => {
    render(<PostTag tags={["React", "TypeScript", "Vitest"]} />);

    expect(screen.queryByText(/Vitest/)).not.toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
