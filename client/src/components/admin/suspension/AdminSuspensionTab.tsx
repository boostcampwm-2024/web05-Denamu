import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useSuspendedUsers } from "@/hooks/queries/useUserSuspension";
import { Ban, Clock } from "lucide-react";

export default function AdminSuspensionTab() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useSuspendedUsers();

  const suspensions = data?.pages.flatMap((page) => page.result) ?? [];

  return (
    <section className="flex flex-col gap-4 min-h-[300px]">
      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-red-500">정지된 유저 목록을 불러오지 못했습니다.</p>
      ) : suspensions.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">정지된 유저가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {suspensions.map((suspension) => (
            <Card key={suspension.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {suspension.suspendedUntil ? (
                    <Badge className="gap-1 border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
                      <Clock className="h-3 w-3" />
                      {new Date(suspension.suspendedUntil).toLocaleString()}까지 정지
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="h-3 w-3" />
                      영구 정지
                    </Badge>
                  )}
                  <span className="text-sm font-medium">
                    {suspension.user.userName} ({suspension.user.email})
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(suspension.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-500">처리자: {suspension.admin ? suspension.admin.name : "알 수 없음"}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{suspension.detail}</p>
              </CardContent>
            </Card>
          ))}

          {hasNextPage && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
