import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Bell } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  useMarkNotificationRead,
  useNotificationList,
  useUnreadNotificationCount,
} from "@/hooks/queries/useNotifications";

import { NotificationItem } from "@/api/services/notifications";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const buildMessage = (item: NotificationItem) => {
  switch (item.type) {
    case "LIKE":
    default: {
      const actorSuffix = item.otherCount > 0 ? `님 외 ${item.otherCount}명이 ` : "님이 ";
      return (
        <>
          <span className="font-semibold">{item.actor.userName ?? "알 수 없는 사용자"}</span>
          {actorSuffix}
          <span className="font-semibold">{item.feed.title}</span>에{" "}
          <span className="font-semibold">좋아요를 표시했습니다</span>.
        </>
      );
    }
  }
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: unreadCount = 0 } = useUnreadNotificationCount(isAuthenticated);
  const { data: items = [], isLoading } = useNotificationList(isAuthenticated && open);
  const { mutate: markRead } = useMarkNotificationRead();

  if (!isAuthenticated) return null;

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) markRead(item.id);
    setOpen(false);
    navigate(`/${item.feed.id}`, { state: { backgroundLocation: location } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="알림" className="relative mx-1 rounded-full">
          <Bell className="!h-5 !w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              data-testid="unread-badge"
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">알림</p>
          <p className="mt-0.5 text-xs text-muted-foreground">30일이 지난 알림은 그날 오전 4시에 자동으로 삭제돼요.</p>
        </div>
        <ScrollArea className="max-h-[30rem]">
          {isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">불러오는 중...</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">알림이 없습니다.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                data-testid="notification-item"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "flex w-full items-start gap-3 border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-accent",
                  item.isRead ? "bg-muted/60 text-muted-foreground" : "bg-primary/5"
                )}
              >
                <Avatar className={cn("h-8 w-8 shrink-0", item.isRead && "grayscale")}>
                  <AvatarImage src={item.actor.profileImage ?? undefined} />
                  <AvatarFallback>{item.actor.userName?.slice(0, 2).toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2">{buildMessage(item)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleString()}</p>
                </div>
                {!item.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
