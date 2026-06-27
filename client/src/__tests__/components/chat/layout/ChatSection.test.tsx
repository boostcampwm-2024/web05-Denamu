import { describe, expect, it, vi } from "vitest";

import { forwardRef } from "react";

import ChatSection from "@/components/chat/layout/ChatSection.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("@/store/useChatStore", () => ({
  useChatStore: (selector: (s: { chatLength: () => number }) => unknown) => selector({ chatLength: () => 0 }),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
    <div ref={ref}>{children}</div>
  )),
}));

vi.mock("@/components/chat/layout/ChatHistory", () => ({
  default: ({ isFull, isConnected }: { isFull: boolean; isConnected: boolean }) => (
    <div data-testid="chat-history">{`${isFull}-${isConnected}`}</div>
  ),
}));

describe("ChatSection", () => {
  it("ChatHistory에 isFull/isConnected를 전달하며 렌더링해야 한다", () => {
    render(<ChatSection isFull={false} isConnected={true} />);

    expect(screen.getByTestId("chat-history")).toHaveTextContent("false-true");
  });
});
