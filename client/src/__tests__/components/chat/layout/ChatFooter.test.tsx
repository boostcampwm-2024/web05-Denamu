import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import ChatFooter from "@/components/chat/layout/ChatFooter.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const sendMessage = vi.fn();

vi.mock("lucide-react", () => lucideProxy());

vi.mock("emoji-picker-react", () => ({
  default: () => <div data-testid="emoji-picker" />,
  Theme: { AUTO: "auto" },
}));

vi.mock("@/hooks/common/useKeyboardShortcut", () => ({ useKeyboardShortcut: vi.fn() }));

vi.mock("@/store/useChatStore", () => ({
  useChatStore: () => ({ sendMessage }),
}));

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: false }),
}));

vi.mock("@/components/ui/popover", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Popover: pass, PopoverContent: pass, PopoverTrigger: pass };
});

vi.mock("@/components/ui/sheet", () => ({
  SheetFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ChatFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("userID", "me");
  });

  it("메시지 입력 후 전송 버튼 클릭 시 sendMessage를 호출해야 한다", () => {
    render(<ChatFooter />);

    fireEvent.change(screen.getByPlaceholderText("메시지를 입력하세요"), { target: { value: "안녕" } });
    fireEvent.click(screen.getByTestId("lucide-Send").closest("button")!);

    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ message: "안녕", userId: "me" }));
  });

  it("빈 메시지는 전송하지 않아야 한다", () => {
    render(<ChatFooter />);

    fireEvent.click(screen.getByTestId("lucide-Send").closest("button")!);

    expect(sendMessage).not.toHaveBeenCalled();
  });
});
