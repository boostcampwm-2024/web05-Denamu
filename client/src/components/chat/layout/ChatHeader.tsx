import { MessageCircleMore } from "lucide-react";

import { CloseChat } from "@/components/chat/ChatButton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarHeader } from "@/components/ui/sidebar";

import { ANONYMOUS_ROOMS, MAX_ROOM_CLIENTS } from "@/constants/chat";

import { useChatStore } from "@/store/useChatStore";

function getRoomStatusColor(userCount: number): string {
  const ratio = userCount / MAX_ROOM_CLIENTS;
  if (ratio >= 0.8) return "bg-red-500 hover:bg-red-500 text-white";
  if (ratio >= 0.5) return "bg-yellow-400 hover:bg-yellow-400 text-black";
  return "bg-green-500 hover:bg-green-500 text-white";
}

export default function ChatHeader() {
  const { userCount, currentRoomId, switchRoom } = useChatStore();
  return (
    <SidebarHeader>
      <div className="flex justify-between px-2.5 py-5 items-center">
        <div className="flex gap-2 items-center">
          <span>
            <b>실시간 채팅</b>
          </span>
          <MessageCircleMore size={20} className="text-primary" />
          <Badge className={`h-6 px-2.5 rounded-full text-xs flex items-center ${getRoomStatusColor(userCount)}`}>
            {userCount} / {MAX_ROOM_CLIENTS}명 참여중
          </Badge>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={currentRoomId || undefined} onValueChange={switchRoom}>
            <SelectTrigger className="w-auto gap-1.5 font-semibold border border-border/60 bg-muted/50 hover:bg-muted rounded-full px-2.5 h-6 text-xs shadow-none focus:ring-1 focus:ring-primary/40 transition-colors">
              <SelectValue placeholder="방 선택" />
            </SelectTrigger>
            <SelectContent className="min-w-[160px]">
              {ANONYMOUS_ROOMS.map(({ roomId, roomName }) => (
                <SelectItem key={roomId} value={roomId} className="text-sm cursor-pointer">
                  {roomName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CloseChat />
        </div>
      </div>
      <Separator />
    </SidebarHeader>
  );
}
