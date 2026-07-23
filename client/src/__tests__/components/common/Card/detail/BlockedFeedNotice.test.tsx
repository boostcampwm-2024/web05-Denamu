import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { BlockedFeedNotice } from "@/components/common/Card/detail/BlockedFeedNotice.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("BlockedFeedNotice", () => {
  it("차단 안내 문구를 렌더링해야 한다", () => {
    render(<BlockedFeedNotice />);

    expect(screen.getByText("차단된 RSS의 게시글입니다.")).toBeInTheDocument();
  });
});
