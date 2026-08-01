import { describe, expect, it } from "vitest";

import { AuthCard } from "@/components/auth/AuthCard.tsx";

import { render, screen } from "@testing-library/react";

describe("AuthCard", () => {
  it("title, description, children을 렌더링해야 한다", () => {
    render(
      <AuthCard title="로그인" description="설명입니다">
        <button>제출</button>
      </AuthCard>
    );

    expect(screen.getByText("로그인")).toBeInTheDocument();
    expect(screen.getByText("설명입니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "제출" })).toBeInTheDocument();
  });
});
