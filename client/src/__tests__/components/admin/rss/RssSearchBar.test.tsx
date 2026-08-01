import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { RssRequestSearchBar } from "@/components/admin/rss/RssSearchBar.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const setSearchParam = vi.fn();

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useSearchStore", () => ({
  useAdminSearchStore: () => ({ searchParam: "", setSearchParam }),
}));

describe("RssRequestSearchBar", () => {
  it("검색 입력 시 setSearchParam을 호출해야 한다", () => {
    render(<RssRequestSearchBar />);

    fireEvent.change(screen.getByPlaceholderText("블로그명, URL 또는 신청자로 검색"), {
      target: { value: "velog" },
    });

    expect(setSearchParam).toHaveBeenCalledWith("velog");
  });
});
