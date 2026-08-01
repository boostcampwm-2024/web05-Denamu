import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Megaphone, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useBoards } from "@/hooks/queries/useBoards";

const RECENT_LIMIT = 5;

export const NoticeBell = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useBoards({ page: 1, limit: RECENT_LIMIT, category: "NOTICE" }, open);
  const notices = data?.result ?? [];

  const handleItemClick = (id: number) => {
    setOpen(false);
    navigate(`/board/${id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="공지사항" className="relative mx-1 rounded-full">
          <Megaphone className="!h-5 !w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">공지사항</p>
        </div>
        <ScrollArea className="max-h-[24rem]">
          {isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">불러오는 중...</p>
          ) : notices.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">공지사항이 없습니다.</p>
          ) : (
            notices.map((notice) => (
              <button
                key={notice.id}
                onClick={() => handleItemClick(notice.id)}
                className="flex w-full items-center gap-2 border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-accent"
              >
                {notice.isPinned && (
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Pin className="h-3 w-3" />
                  </Badge>
                )}
                <span className="flex-1 truncate">{notice.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </ScrollArea>
        <button
          onClick={() => {
            setOpen(false);
            navigate("/board");
          }}
          className="block w-full border-t px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-accent"
        >
          전체보기
        </button>
      </PopoverContent>
    </Popover>
  );
};
