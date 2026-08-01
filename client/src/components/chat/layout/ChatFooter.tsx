import { useState } from "react";

import type { EmojiClickData } from "emoji-picker-react";
import { Send } from "lucide-react";

import EmojiPickerButton from "@/components/common/EmojiPickerButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";

import { useKeyboardShortcut } from "@/hooks/common/useKeyboardShortcut";

import { useChatStore } from "@/store/useChatStore";

export default function ChatFooter() {
  const [message, setMessage] = useState<string>("");
  const { sendMessage } = useChatStore();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendMessage({
        message: message,
        messageId: crypto.randomUUID(),
        userId: localStorage.getItem("userID") as string,
      });
      setMessage("");
    }
  };

  useKeyboardShortcut("Enter", () => handleSendMessage(), false);

  return (
    <SheetFooter className="p-3 border-t">
      <div className="flex items-center gap-2 w-full bg-muted rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
        <Input
          placeholder="메시지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-0 text-sm"
        />
        <EmojiPickerButton onEmojiClick={handleEmojiClick} />
        <Button
          size="icon"
          className="rounded-lg shrink-0 bg-primary hover:bg-[#2ECC71] text-white h-8 w-8 transition-colors"
          onClick={handleSendMessage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </SheetFooter>
  );
}
