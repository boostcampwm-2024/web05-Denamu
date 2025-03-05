import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";

import { useKeyboardShortcut } from "@/hooks/common/useKeyboardShortcut";

import { useChatValueStore, useChatStore } from "@/store/useChatStore";

export default function ChatFooter() {
  const { message, setMessage } = useChatValueStore();
  const { sendMessage } = useChatStore();

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendMessage(message);
      setMessage("");
    }
  };

  useKeyboardShortcut("Enter", () => handleSendMessage(), false);

  return (
    <SheetFooter className="flex flex-row items-center p-2">
      <Input
        placeholder="메시지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="rounded-r-none"
      />
      <Button className="bg-primary hover:bg-[#2ECC71] text-white  rounded-l-none" onClick={handleSendMessage}>
        <Send />
      </Button>
    </SheetFooter>
  );
}
