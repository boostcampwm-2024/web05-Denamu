import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import ChatHeader from "@/components/chat/layout/ChatHeader.tsx";

import { render, screen } from "@testing-library/react";

let userCount: number;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useChatStore", () => ({
  useChatStore: () => ({ userCount, currentRoomId: "anonymous1", switchRoom: vi.fn() }),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/chat/ChatButton", () => ({ CloseChat: () => <button data-testid="close-chat" /> }));

vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    Select: pass,
    SelectContent: pass,
    SelectItem: pass,
    SelectTrigger: pass,
    SelectValue: () => <span>방 선택</span>,
  };
});

describe("ChatHeader", () => {
  beforeEach(() => {
    userCount = 10;
  });

  it("제목과 참여 인원 배지를 렌더링해야 한다", () => {
    render(<ChatHeader />);

    expect(screen.getByText("실시간 채팅")).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 50명 참여중/)).toBeInTheDocument();
  });

  it("참여율 80% 이상이면 배지가 빨간색이어야 한다", () => {
    userCount = 45;
    render(<ChatHeader />);

    expect(screen.getByText(/45 \/ 50명 참여중/)).toHaveClass("bg-red-500");
  });

  it("참여율 50% 미만이면 배지가 초록색이어야 한다", () => {
    userCount = 10;
    render(<ChatHeader />);

    expect(screen.getByText(/10 \/ 50명 참여중/)).toHaveClass("bg-green-500");
  });
});
