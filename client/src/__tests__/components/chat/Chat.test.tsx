import { beforeEach, describe, expect, it, vi } from "vitest";

import { Chat } from "@/components/chat/Chat.tsx";

import { render, screen } from "@testing-library/react";

const connect = vi.fn();
const disconnect = vi.fn();
const getHistory = vi.fn();

vi.mock("@/store/useChatStore", () => ({
  useChatStore: () => ({ userCount: 0, isConnected: true, connect, disconnect, getHistory }),
}));

vi.mock("@/hooks/common/useVisible", () => ({ useVisible: () => true }));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/chat/layout/ChatHeader", () => ({ default: () => <div data-testid="chat-header" /> }));
vi.mock("@/components/chat/layout/ChatSection", () => ({ default: () => <div data-testid="chat-section" /> }));
vi.mock("@/components/chat/layout/ChatFooter", () => ({ default: () => <div data-testid="chat-footer" /> }));

describe("Chat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("헤더/섹션/푸터를 렌더링해야 한다", () => {
    render(<Chat />);

    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(screen.getByTestId("chat-section")).toBeInTheDocument();
    expect(screen.getByTestId("chat-footer")).toBeInTheDocument();
  });

  it("마운트 시 connect와 getHistory를 호출해야 한다", () => {
    render(<Chat />);

    expect(connect).toHaveBeenCalledWith("anonymous");
    expect(getHistory).toHaveBeenCalledTimes(1);
  });
});
