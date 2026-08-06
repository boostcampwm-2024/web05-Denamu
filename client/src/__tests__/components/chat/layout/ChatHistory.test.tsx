import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import ChatHistory from "@/components/chat/layout/ChatHistory.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

let storeState: {
  chatHistory: Array<{ message: string; userName: string; timestamp: string }>;
  isLoading: boolean;
  connect: (room?: string) => void;
  currentRoomId: string;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useChatStore", () => ({
  useChatStore: () => storeState,
}));

vi.mock("@/utils/date", () => ({
  getLocalDateString: (ts: string) => ts.slice(0, 10),
  getLocalMinuteKey: (ts: string) => ts.slice(0, 16),
}));

vi.mock("@/components/chat/ChatItem", () => ({
  default: ({ chatItem }: { chatItem: { message: string } }) => <div data-testid="chat-item">{chatItem.message}</div>,
}));

vi.mock("@/components/chat/layout/ChatSkeleton", () => ({
  default: () => <div data-testid="chat-skeleton" />,
}));

vi.mock("@/assets/empty-panda.svg", () => ({ default: "empty.svg" }));

describe("ChatHistory", () => {
  beforeEach(() => {
    storeState = { chatHistory: [], isLoading: false, connect: vi.fn(), currentRoomId: "" };
  });

  it("로딩 중이면 ChatSkeleton을 렌더링해야 한다", () => {
    storeState.isLoading = true;
    render(<ChatHistory isFull={false} isConnected={true} />);

    expect(screen.getByTestId("chat-skeleton")).toBeInTheDocument();
  });

  it("연결되지 않았으면 안내 문구를 렌더링해야 한다", () => {
    render(<ChatHistory isFull={false} isConnected={false} />);

    expect(screen.getByText("채팅이 연결되지 않았습니다.")).toBeInTheDocument();
  });

  it("연결되지 않았을 때 재연결 버튼 클릭 시 onReconnect가 호출된다", () => {
    const onReconnect = vi.fn();
    render(<ChatHistory isFull={false} isConnected={false} onReconnect={onReconnect} />);

    fireEvent.click(screen.getByRole("button", { name: "재연결" }));

    expect(onReconnect).toHaveBeenCalledTimes(1);
    expect(storeState.connect).not.toHaveBeenCalled();
  });

  it("onReconnect가 없으면 재연결 버튼이 store의 connect를 현재 방으로 호출한다", () => {
    storeState.currentRoomId = "room-1";
    render(<ChatHistory isFull={false} isConnected={false} />);

    fireEvent.click(screen.getByRole("button", { name: "재연결" }));

    expect(storeState.connect).toHaveBeenCalledWith("room-1");
  });

  it("방이 가득 찼으면 경고를 렌더링해야 한다", () => {
    render(<ChatHistory isFull={true} isConnected={true} />);

    expect(screen.getByText("모든 채팅방이 가득 찼습니다")).toBeInTheDocument();
  });

  it("채팅 기록이 없으면 빈 안내를 렌더링해야 한다", () => {
    render(<ChatHistory isFull={false} isConnected={true} />);

    expect(screen.getByText("이전 채팅 기록이 없습니다")).toBeInTheDocument();
  });

  it("채팅 기록이 있으면 ChatItem 목록을 렌더링해야 한다", () => {
    storeState.chatHistory = [
      { message: "첫 메시지", userName: "A", timestamp: "2024-03-26T12:00:00" },
      { message: "둘째 메시지", userName: "B", timestamp: "2024-03-26T12:01:00" },
    ];
    render(<ChatHistory isFull={false} isConnected={true} />);

    expect(screen.getAllByTestId("chat-item")).toHaveLength(2);
  });
});
