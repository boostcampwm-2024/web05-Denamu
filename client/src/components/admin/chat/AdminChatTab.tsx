import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { formatTime } from "@/utils/time";

import { adminChat } from "@/api/services/admin/chat";
import { AdminChatRoom } from "@/types/chat";

export default function AdminChatTab() {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<AdminChatRoom | null>(null);

  const { data: rooms = [], isLoading: isRoomsLoading } = useQuery({
    queryKey: ["admin-chat-rooms"],
    queryFn: adminChat.getRooms,
    refetchInterval: 10000,
  });

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["admin-chat-messages", selectedRoom?.roomId],
    queryFn: () => adminChat.getMessages(selectedRoom!.roomId),
    enabled: !!selectedRoom,
    refetchInterval: 5000,
  });

  const { mutate: removeChat } = useMutation({
    mutationFn: ({ roomId, messageId }: { roomId: string; messageId: string }) =>
      adminChat.remove(roomId, messageId),
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["admin-chat-rooms"] });
    },
  });

  const handleDelete = (messageId?: string) => {
    if (!selectedRoom || !messageId) return;
    if (!window.confirm("이 채팅을 삭제하시겠습니까?")) return;
    removeChat({ roomId: selectedRoom.roomId, messageId });
  };

  return (
    <section className="flex flex-col gap-4 lg:flex-row min-h-[400px]">
      <div className="lg:w-1/3 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">채팅방</h2>
        {isRoomsLoading ? (
          <div>Loading...</div>
        ) : (
          rooms.map((room) => (
            <Card
              key={room.roomId}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedRoom?.roomId === room.roomId ? "border-primary bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{room.roomName}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {room.userCount}
                </span>
              </div>
              <Badge variant="secondary" className="mt-2">
                메시지 {room.messageCount}
              </Badge>
            </Card>
          ))
        )}
      </div>

      <div className="lg:w-2/3 flex flex-col gap-2">
        {!selectedRoom ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            채팅방을 선택해주세요.
          </div>
        ) : isMessagesLoading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            메시지가 없습니다.
          </div>
        ) : (
          messages.map((msg, index) => (
            <Card
              key={msg.messageId ?? `legacy-${index}`}
              className="p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{msg.userName}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="mt-1 break-words whitespace-pre-wrap text-sm">{msg.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-600 shrink-0 disabled:opacity-30"
                onClick={() => handleDelete(msg.messageId)}
                disabled={!msg.messageId || msg.deleted}
                title={
                  msg.deleted
                    ? "이미 삭제된 메시지입니다."
                    : msg.messageId
                      ? "채팅 삭제"
                      : "이전 버전 메시지라 삭제할 수 없습니다."
                }
                aria-label="채팅 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
