import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import ShareButton from "@/components/common/Card/detail/ShareButton.tsx";

import { FeedDetail } from "@/types/post.ts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockToast = vi.fn();
const writeText = vi.fn().mockResolvedValue(undefined);
const sendDefault = vi.fn();
let isMobile: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: mockToast }),
}));

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile }),
}));

const post = { id: 42, title: "공유 제목", thumbnail: "thumb.jpg" } as FeedDetail;

describe("ShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile = false;
    window.Kakao = { cleanup: vi.fn(), init: vi.fn(), Share: { sendDefault } } as never;
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it("링크 복사 클릭 시 클립보드에 URL을 쓰고 toast를 띄워야 한다", async () => {
    render(<ShareButton post={post} />);

    fireEvent.click(screen.getByRole("button", { name: /링크 복사/ }));

    expect(writeText).toHaveBeenCalledWith("https://denamu.dev/42");
    await waitFor(() => expect(mockToast).toHaveBeenCalled());
  });

  it("카카오톡 공유 클릭 시 Kakao.Share.sendDefault를 호출해야 한다", () => {
    render(<ShareButton post={post} />);

    fireEvent.click(screen.getByRole("button", { name: /카카오톡 공유하기/ }));

    expect(sendDefault).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.objectContaining({ title: "공유 제목" }) })
    );
  });

  it("마운트 시 Kakao.init을 호출해야 한다", () => {
    render(<ShareButton post={post} />);

    expect(window.Kakao.init).toHaveBeenCalledWith("8d3c34e34749e7bd399a388d59b1af24");
  });

  it("모바일에서도 링크 복사/카카오톡 버튼을 렌더링하고 동작해야 한다", async () => {
    isMobile = true;
    render(<ShareButton post={post} />);

    expect(screen.getByText("링크 복사")).toBeInTheDocument();
    expect(screen.getByText("카카오톡")).toBeInTheDocument();

    fireEvent.click(screen.getByText("링크 복사"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://denamu.dev/42"));

    fireEvent.click(screen.getByText("카카오톡"));
    expect(sendDefault).toHaveBeenCalled();
  });
});
