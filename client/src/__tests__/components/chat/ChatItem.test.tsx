import { beforeEach, describe, expect, it, vi } from "vitest";

import ChatItem from "@/components/chat/ChatItem.tsx";

import { ChatType } from "@/types/chat.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const resendMessage = vi.fn();
const deleteMessage = vi.fn();

vi.mock("avvvatars-react", () => ({ default: () => <span data-testid="avvvatar" /> }));

vi.mock("@/utils/time", () => ({ formatTime: () => "12:00" }));

vi.mock("@/store/useChatStore", () => ({
  useChatStore: (selector: (s: { resendMessage: typeof resendMessage; deleteMessage: typeof deleteMessage }) => unknown) =>
    selector({ resendMessage, deleteMessage }),
}));

const makeChat = (override: Partial<ChatType> = {}): ChatType =>
  ({
    userId: "other",
    userName: "상대방",
    message: "안녕하세요",
    timestamp: "2024-03-26T12:00:00Z",
    isFailed: false,
    messageId: "msg-1",
    ...override,
  }) as ChatType;

describe("ChatItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("userID", "me");
  });

  it("다른 사용자의 메시지는 작성자명과 메시지를 렌더링해야 한다", () => {
    render(<ChatItem chatItem={makeChat()} isSameUser={false} />);

    expect(screen.getByText("상대방")).toBeInTheDocument();
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
  });

  it("내 메시지는 '나 (이름)' 형식으로 렌더링해야 한다", () => {
    render(<ChatItem chatItem={makeChat({ userId: "me", userName: "내이름" })} isSameUser={false} />);

    expect(screen.getByText("나 (내이름)")).toBeInTheDocument();
  });

  it("전송 실패한 내 메시지는 재전송/삭제 버튼을 표시하고 동작해야 한다", () => {
    const chat = makeChat({ userId: "me", isFailed: true, messageId: "fail-1" });
    render(<ChatItem chatItem={chat} isSameUser={false} />);

    fireEvent.click(screen.getByRole("button", { name: "재전송" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(resendMessage).toHaveBeenCalledWith(chat);
    expect(deleteMessage).toHaveBeenCalledWith("fail-1");
  });

  it("isSameUser면 작성자 헤더를 생략해야 한다", () => {
    render(<ChatItem chatItem={makeChat()} isSameUser={true} />);

    expect(screen.queryByText("상대방")).not.toBeInTheDocument();
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
  });
});
