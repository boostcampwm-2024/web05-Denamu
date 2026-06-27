import { describe, expect, it, vi } from "vitest";

import { ChatSection } from "@/components/layout/sidebar/ChatSection.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("@/components/chat/Chat", () => ({ Chat: () => <div data-testid="chat" /> }));
vi.mock("@/components/chat/ChatButton", () => ({ OpenChat: () => <div data-testid="open-chat" /> }));
vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ChatSection", () => {
  it("Chat과 OpenChat을 SidebarProvider 안에 렌더링해야 한다", () => {
    render(<ChatSection />);

    expect(screen.getByTestId("chat")).toBeInTheDocument();
    expect(screen.getByTestId("open-chat")).toBeInTheDocument();
  });
});
