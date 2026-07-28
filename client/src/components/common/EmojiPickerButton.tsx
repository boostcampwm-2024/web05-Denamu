import { Suspense, lazy } from "react";

import type { EmojiClickData, Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useMediaStore } from "@/store/useMediaStore";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface EmojiPickerButtonProps {
  onEmojiClick: (emojiData: EmojiClickData) => void;
  className?: string;
}

export default function EmojiPickerButton({ onEmojiClick, className }: EmojiPickerButtonProps) {
  const isMobile = useMediaStore((state) => state.isMobile);

  if (isMobile) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={className ?? "rounded-lg shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"}
        >
          <Smile className="!h-6 !w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="z-[1000] w-auto border-none p-0 shadow-none">
        <Suspense fallback={<div style={{ width: 320, height: 400 }} />}>
          <EmojiPicker onEmojiClick={onEmojiClick} theme={"auto" as Theme} lazyLoadEmojis width={320} height={400} />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
