import { useState } from "react";

import { Ban, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useUserSearch } from "@/hooks/queries/useUserSearch";
import {
  useCreateUserSuspension,
  useDeleteUserSuspension,
  useSuspendedUsers,
  useUpdateUserSuspension,
} from "@/hooks/queries/useUserSuspension";

import { toDatetimeLocal } from "@/utils/suspension";

import { SuspensionFormDialog } from "./SuspensionFormDialog";
import { SuspensionReleaseDialog } from "./SuspensionReleaseDialog";
import { UserSearchResult } from "@/types/search";
import { CreateUserSuspensionPayload, SuspendedUserItem, SuspensionFormPayload } from "@/types/userSuspension";

const SEARCH_PAGE_SIZE = 5;

export default function AdminSuspensionTab() {
  const [query, setQuery] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<UserSearchResult | null>(null);
  const [updateTarget, setUpdateTarget] = useState<SuspendedUserItem | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<SuspendedUserItem | null>(null);
  const { toast } = useCustomToast();

  const { data: searchData, isLoading: isSearching } = useUserSearch({
    query,
    page: 1,
    pageSize: SEARCH_PAGE_SIZE,
  });
  const searchResults = searchData?.data.result ?? [];

  const { mutate: createUserSuspension, isPending: isSuspending } = useCreateUserSuspension();
  const { mutate: updateUserSuspension, isPending: isUpdating } = useUpdateUserSuspension();
  const { mutate: deleteUserSuspension, isPending: isDeleting } = useDeleteUserSuspension();

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useSuspendedUsers();

  const suspensions = data?.pages.flatMap((page) => page.result) ?? [];

  const handleSuspend = (payload: Omit<CreateUserSuspensionPayload, "userId">) => {
    if (!suspendTarget) return;
    createUserSuspension(
      { userId: suspendTarget.id, ...payload },
      {
        onSuccess: () => {
          toast({ description: "유저 정지 처리를 완료했습니다." });
          setSuspendTarget(null);
        },
        onError: () => toast({ description: "정지 처리 중 오류가 발생했습니다.", variant: "destructive" }),
      }
    );
  };

  const handleUpdateSubmit = (payload: SuspensionFormPayload) => {
    if (!updateTarget) return;
    updateUserSuspension(
      { userId: updateTarget.user.id, ...payload },
      {
        onSuccess: () => {
          toast({ description: "정지 기간을 수정했습니다." });
          setUpdateTarget(null);
        },
        onError: () => toast({ description: "정지 정보 수정 중 오류가 발생했습니다.", variant: "destructive" }),
      }
    );
  };

  const handleReleaseConfirm = (invalidate: boolean) => {
    if (!releaseTarget) return;
    const userId = releaseTarget.user.id;

    if (invalidate) {
      deleteUserSuspension(userId, {
        onSuccess: () => {
          toast({ description: "정지 내역을 무효 처리했습니다." });
          setReleaseTarget(null);
        },
        onError: () => toast({ description: "정지 내역 삭제 중 오류가 발생했습니다.", variant: "destructive" }),
      });
      return;
    }

    updateUserSuspension(
      { userId, suspendedUntil: new Date().toISOString(), detail: "관리자에 의해 정지 해제 처리되었습니다." },
      {
        onSuccess: () => {
          toast({ description: "정지를 해제했습니다." });
          setReleaseTarget(null);
        },
        onError: () => toast({ description: "정지 해제 중 오류가 발생했습니다.", variant: "destructive" }),
      }
    );
  };

  const updateDialogProps = updateTarget
    ? {
        title: `${updateTarget.user.userName} 유저 정지 기간 수정`,
        submitLabel: "수정 처리",
        initialPreset: updateTarget.suspendedUntil ? null : ("PERMANENT" as const),
        initialDateValue: updateTarget.suspendedUntil ? toDatetimeLocal(new Date(updateTarget.suspendedUntil)) : "",
      }
    : null;

  return (
    <section className="flex flex-col gap-4 min-h-[300px]">
      <div className="flex flex-col gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="정지할 유저의 닉네임을 검색하세요"
        />
        {query.trim().length > 0 && (
          <div className="flex flex-col gap-2">
            {isSearching ? (
              <p className="py-4 text-center text-sm text-gray-400">검색 중...</p>
            ) : searchResults.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">검색 결과가 없습니다.</p>
            ) : (
              searchResults.map((user) => (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between gap-2 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {user.profileImage && <AvatarImage src={user.profileImage} alt={user.userName} />}
                        <AvatarFallback>{user.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.userName}</span>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => setSuspendTarget(user)}>
                      정지
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

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

                <p className="text-sm text-gray-500">
                  처리자: {suspension.admin ? suspension.admin.name : "알 수 없음"}
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{suspension.detail}</p>

                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setUpdateTarget(suspension)}>
                    기간 수정
                  </Button>
                  <Button size="sm" onClick={() => setReleaseTarget(suspension)}>
                    해제
                  </Button>
                </div>
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

      <SuspensionFormDialog
        key={`create-${suspendTarget?.id ?? "none"}`}
        open={!!suspendTarget}
        title={`${suspendTarget?.userName ?? ""} 유저 정지`}
        isPending={isSuspending}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        onSubmit={handleSuspend}
      />

      <SuspensionFormDialog
        key={`update-${updateTarget?.id ?? "none"}`}
        open={!!updateTarget}
        title={updateDialogProps?.title ?? ""}
        submitLabel={updateDialogProps?.submitLabel}
        initialPreset={updateDialogProps?.initialPreset}
        initialDateValue={updateDialogProps?.initialDateValue}
        isPending={isUpdating}
        onOpenChange={(open) => !open && setUpdateTarget(null)}
        onSubmit={handleUpdateSubmit}
      />

      <SuspensionReleaseDialog
        key={`release-${releaseTarget?.id ?? "none"}`}
        open={!!releaseTarget}
        title={`${releaseTarget?.user.userName ?? ""} 유저 정지 해제`}
        isPending={isUpdating || isDeleting}
        onOpenChange={(open) => !open && setReleaseTarget(null)}
        onConfirm={handleReleaseConfirm}
      />
    </section>
  );
}
