import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { Avatar } from "@/components/profile/header/ui/Avatar.tsx";

import { User } from "@/types/profile.ts";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("Profile Avatar", () => {
  it("아바타 이미지와 fallback을 렌더링해야 한다", () => {
    render(<Avatar user={{ avatar: "a.png", rssRegistered: false } as User} />);

    expect(screen.getByTestId("avatar-image")).toHaveAttribute("src", "a.png");
    expect(screen.getByText("KD")).toBeInTheDocument();
  });

  it("rssRegistered면 인증 배지(CheckCircle2)를 표시해야 한다", () => {
    render(<Avatar user={{ avatar: "a.png", rssRegistered: true } as User} />);

    expect(screen.getByTestId("lucide-CheckCircle2")).toBeInTheDocument();
  });

  it("rssRegistered가 false면 인증 배지를 표시하지 않아야 한다", () => {
    render(<Avatar user={{ avatar: "a.png", rssRegistered: false } as User} />);

    expect(screen.queryByTestId("lucide-CheckCircle2")).not.toBeInTheDocument();
  });
});
