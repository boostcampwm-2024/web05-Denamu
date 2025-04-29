import { useEffect, useState, useRef } from "react";

import ChatFooter from "@/components/chat/layout/ChatFooter";
import ChatHeader from "@/components/chat/layout/ChatHeader";
import ChatSection from "@/components/chat/layout/ChatSection";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

import { useVisible } from "@/hooks/common/useVisible";

import { useChatStore } from "@/store/useChatStore";

export function Chat() {
  const { userCount, connect, disconnect, getHistory } = useChatStore();
  const [isFull, setIsFull] = useState<boolean>(false);
  const visible = useVisible();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (userCount >= 500) {
      setIsFull(true);
    }
    connect();
    getHistory();
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      timeoutRef.current = setTimeout(
        () => {
          disconnect();
        },
        3 * 60 * 1000
      );
    } else {
      connect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  return (
    <Sidebar side="right" variant="floating">
      <SidebarContent>
        <ChatHeader />
        <ChatSection isFull={isFull} />
        <ChatFooter />
      </SidebarContent>
    </Sidebar>
  );
}
