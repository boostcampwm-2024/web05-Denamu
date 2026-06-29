import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { Info } from "@/components/profile/header/ui/Info.tsx";

import { User } from "@/types/profile.ts";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

const user = {
  name: "민석",
  email: "min@test.com",
  blogUrl: "https://blog.test",
  bio: "소개글입니다",
  topics: ["React", "Node"],
} as User;

describe("Profile Info", () => {
  it("이름, 이메일, 소개, 블로그 링크를 렌더링해야 한다", () => {
    render(<Info user={user} />);

    expect(screen.getByRole("heading", { name: "민석" })).toBeInTheDocument();
    expect(screen.getByText("min@test.com")).toBeInTheDocument();
    expect(screen.getByText("소개글입니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://blog.test" })).toHaveAttribute("href", "https://blog.test");
  });

  it("관심 토픽들을 Badge로 렌더링해야 한다", () => {
    render(<Info user={user} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node")).toBeInTheDocument();
  });

  it("blogUrl이 없으면 링크를 렌더링하지 않아야 한다", () => {
    render(<Info user={{ ...user, blogUrl: "" } as User} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
