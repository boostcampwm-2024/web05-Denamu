import { Link } from "react-router-dom";

import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useBlockedRss, useBlockedUsers, useUnblockRss, useUnblockUser } from "@/hooks/queries/useBlock.ts";

export const BlockManagementTab = () => {
  const { data: blockedUsers = [], isLoading } = useBlockedUsers();
  const { data: blockedRss = [], isLoading: isRssLoading } = useBlockedRss();
  const { mutate: unblockUser, isPending } = useUnblockUser();
  const { mutate: unblockRss, isPending: isRssUnblockPending } = useUnblockRss();
  const { toast } = useCustomToast();

  const handleUnblock = (userId: number, userName: string) => {
    unblockUser(userId, {
      onSuccess: () => {
        toast({ title: "차단 해제 완료", description: `${userName}님의 차단을 해제했습니다.` });
      },
      onError: () => {
        toast({ title: "차단 해제 실패", description: "잠시 후 다시 시도해주세요." });
      },
    });
  };

  const handleRssUnblock = (rssId: number, name: string) => {
    unblockRss(rssId, {
      onSuccess: () => {
        toast({ title: "차단 해제 완료", description: `${name} RSS의 차단을 해제했습니다.` });
      },
      onError: () => {
        toast({ title: "차단 해제 실패", description: "잠시 후 다시 시도해주세요." });
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-2xl font-semibold leading-none">차단 관리</h3>

        <Tabs defaultValue="users">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="users" className="w-full">
              사용자
            </TabsTrigger>
            <TabsTrigger value="rss" className="w-full">
              RSS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {isLoading ? (
              <p className="text-sm text-gray-400">불러오는 중...</p>
            ) : blockedUsers.length === 0 ? (
              <p className="text-sm text-gray-400">차단한 사용자가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {blockedUsers.map(({ user }) => {
                  const initials = user.userName ? user.userName.substring(0, 2).toUpperCase() : "사용자";
                  return (
                    <li
                      key={user.id}
                      className="flex items-center justify-between gap-3 p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center min-w-0 gap-3">
                        <Avatar className="flex-shrink-0 w-10 h-10">
                          {user.profileImage && <AvatarImage src={user.profileImage} alt={user.userName} />}
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium truncate">{user.userName}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleUnblock(user.id, user.userName)}
                        >
                          차단 해제
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="rss">
            {isRssLoading ? (
              <p className="text-sm text-gray-400">불러오는 중...</p>
            ) : blockedRss.length === 0 ? (
              <p className="text-sm text-gray-400">차단한 RSS가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {blockedRss.map(({ rss }) => (
                  <li
                    key={rss.id}
                    className="flex items-center justify-between gap-3 p-4 border border-gray-100 rounded-lg"
                  >
                    <Link to={`/rss/${rss.id}`} className="flex items-center min-w-0 gap-3">
                      <PlatformIcon
                        platform={rss.blogPlatform}
                        image={rss.blogImage}
                        name={rss.name}
                        className="flex-shrink-0 w-10 h-10"
                      />
                      <p className="font-medium truncate">{rss.name}</p>
                    </Link>
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRssUnblockPending}
                        onClick={() => handleRssUnblock(rss.id, rss.name)}
                      >
                        차단 해제
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
