import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import AdminChatTab from "@/components/admin/chat/AdminChatTab.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const removeChat = vi.fn();
let rooms: Array<{ roomId: string; roomName: string; userCount: number; messageCount: number }>;
let messages: Array<{ messageId: string; userName: string; message: string; timestamp: string; deleted?: boolean }>;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/utils/time", () => ({ formatTime: () => "12:00" }));

vi.mock("@/api/services/admin/chat", () => ({
  adminChat: { getRooms: vi.fn(), getMessages: vi.fn(), remove: vi.fn() },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) =>
    queryKey[0] === "admin-chat-rooms"
      ? { data: rooms, isLoading: false }
      : { data: messages, isLoading: false, refetch: vi.fn() },
  useMutation: () => ({ mutate: removeChat }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

describe("AdminChatTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rooms = [{ roomId: "r1", roomName: "익명 채팅방 1", userCount: 3, messageCount: 10 }];
    messages = [{ messageId: "m1", userName: "유저", message: "안녕", timestamp: "2024-03-26T12:00:00Z" }];
  });

  it("채팅방 목록을 렌더링하고 초기에는 선택 안내를 표시해야 한다", () => {
    render(<AdminChatTab />);

    expect(screen.getByText("익명 채팅방 1")).toBeInTheDocument();
    expect(screen.getByText("채팅방을 선택해주세요.")).toBeInTheDocument();
  });

  it("채팅방 선택 시 메시지를 렌더링해야 한다", () => {
    render(<AdminChatTab />);

    fireEvent.click(screen.getByText("익명 채팅방 1"));

    expect(screen.getByText("안녕")).toBeInTheDocument();
    expect(screen.getByText("유저")).toBeInTheDocument();
  });

  it("삭제 클릭 시 confirm 후 removeChat을 호출해야 한다", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AdminChatTab />);

    fireEvent.click(screen.getByText("익명 채팅방 1"));
    fireEvent.click(screen.getByRole("button", { name: "채팅 삭제" }));

    expect(removeChat).toHaveBeenCalledWith({ roomId: "r1", messageId: "m1" });
  });

  it("confirm을 취소하면 removeChat을 호출하지 않아야 한다", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<AdminChatTab />);

    fireEvent.click(screen.getByText("익명 채팅방 1"));
    fireEvent.click(screen.getByRole("button", { name: "채팅 삭제" }));

    expect(removeChat).not.toHaveBeenCalled();
  });
});
