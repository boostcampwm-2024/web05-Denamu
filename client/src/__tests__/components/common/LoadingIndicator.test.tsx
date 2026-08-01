import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { LoadingIndicator } from "@/components/common/LoadingIndicator.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

describe("LoadingIndicator", () => {
  it("로딩 문구와 스피너 아이콘을 렌더링해야 한다", () => {
    render(<LoadingIndicator />);

    expect(screen.getByText("포스트를 불러오는 중...")).toBeInTheDocument();
    expect(screen.getByTestId("lucide-Loader2")).toBeInTheDocument();
  });
});
