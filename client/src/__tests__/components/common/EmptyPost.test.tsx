import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import EmptyPost from "@/components/common/EmptyPost.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("EmptyPost", () => {
  it("빈 상태 안내 문구를 렌더링해야 한다", () => {
    render(<EmptyPost />);

    expect(screen.getByText("오늘의 트렌딩 포스트가 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("여러분의 읽은 글이 인기 포스트로 올라갈 수 있어요!")).toBeInTheDocument();
  });
});
