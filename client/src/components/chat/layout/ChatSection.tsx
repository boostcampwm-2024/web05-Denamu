import { useEffect, useRef } from "react";

import ChatHistory from "@/components/chat/layout/ChatHistory";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useChatStore } from "@/store/useChatStore";

export default function ChatSection({ isFull, isConnected }: { isFull: boolean; isConnected: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatLength = useChatStore((state) => state.chatLength);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContent = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContent && chatLength() > 0) {
        scrollContent.scrollTo({
          top: scrollContent.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [chatLength()]);
  return (
    <ScrollArea ref={scrollRef} className="h-full">
      <ChatHistory isFull={isFull} isConnected={isConnected} />
    </ScrollArea>
  );
}
