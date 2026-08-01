import { describe, expect, it } from "vitest";

import ChatSkeleton from "@/components/chat/layout/ChatSkeleton.tsx";

import { render } from "@testing-library/react";

describe("ChatSkeleton", () => {
  it("number만큼 스켈레톤 행을 렌더링해야 한다", () => {
    const { container } = render(<ChatSkeleton number={5} />);

    expect(container.firstChild?.childNodes).toHaveLength(5);
  });
});
