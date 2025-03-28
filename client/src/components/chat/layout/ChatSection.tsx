import { useEffect, useRef } from "react";

import { CircleAlert } from "lucide-react";

import ChatItem from "@/components/chat/ChatItem";
import ChatSkeleton from "@/components/chat/layout/ChatSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import Empty from "@/assets/empty-panda.svg";

import { useChatStore } from "@/store/useChatStore";
import { ChatType } from "@/types/chat";

const FullChatWarning = () => (
  <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
    <CircleAlert color="red" size={200} />
    <div className="flex flex-col items-center gap-1">
      <p className="font-bold">채팅창 인원이 500명 이상입니다</p>
      <p>잠시 기다렸다가 새로고침을 해주세요</p>
    </div>
  </div>
);

const EmptyChatHistory = () => (
  <div className="flex flex-col flex-1 justify-center items-center h-[70vh] gap-3">
    <img src={Empty} alt="비어있는 채팅" className="w-[50%] rounded-full" />
    <div className="flex flex-col items-center gap-1">
      <p className="font-bold">이전 채팅 기록이 없습니다</p>
      <p>새로운 채팅을 시작해보세요!!</p>
    </div>
  </div>
);

const RenderHistory = ({
  chatHistory,
  isFull,
  isLoading,
}: {
  chatHistory: ChatType[];
  isFull: boolean;
  isLoading: boolean;
}) => {
  if (isLoading) return <ChatSkeleton number={14} />;
  if (isFull) return <FullChatWarning />;
  if (chatHistory.length === 0) return <EmptyChatHistory />;
  return (
    <span className="flex flex-col gap-3 px-3">
      {chatHistory.map((item, index) => {
        const isSameUser = index > 0 && chatHistory[index - 1]?.username === item.username;
        return <ChatItem key={index} chatItem={item} isSameUser={isSameUser} />;
      })}
    </span>
  );
};

export default function ChatSection({ isFull }: { isFull: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatHistory, isLoading } = useChatStore();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContent = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContent && chatHistory.length > 0) {
        scrollContent.scrollTo({
          top: scrollContent.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [chatHistory.length]);

  return (
    <ScrollArea ref={scrollRef} className="h-full">
      <RenderHistory chatHistory={chatHistory} isFull={isFull} isLoading={isLoading} />
    </ScrollArea>
  );
}
