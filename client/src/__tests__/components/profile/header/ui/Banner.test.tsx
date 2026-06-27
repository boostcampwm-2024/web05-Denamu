import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { Banner } from "@/components/profile/header/ui/Banner.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("Profile Banner", () => {
  it("인증 문구와 마지막 포스팅 일자를 렌더링해야 한다", () => {
    render(<Banner lastPosted="2024-03-26" />);

    expect(screen.getByText("인증된 RSS 블로거")).toBeInTheDocument();
    expect(screen.getByText("마지막 포스팅: 2024-03-26")).toBeInTheDocument();
  });
});
