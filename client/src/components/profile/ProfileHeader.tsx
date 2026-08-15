import { useState } from "react";

import axios from "axios";
import { MoreVertical, Ban, Flag } from "lucide-react";

import { BlockConfirmDialog } from "@/components/common/BlockConfirmDialog";
import { ReportDialog } from "@/components/common/ReportDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useBlockRss, useBlockUser } from "@/hooks/queries/useBlock.ts";
import { useCertifiedRss } from "@/hooks/queries/useProfile.ts";
import { useReportUser } from "@/hooks/queries/useReport";

import { getReportErrorMessage } from "@/utils/reportError";

import { CreateReportPayload } from "@/types/report";

interface ProfileHeaderProps {
  name: string;
  email: string;
  profileImage: string | null;
  introduction: string | null;
  blockableUserId?: number;
}

export const ProfileHeader = ({ name, email, profileImage, introduction, blockableUserId }: ProfileHeaderProps) => {
  const initials = name ? name.substring(0, 2).toUpperCase() : "사용자";
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { toast } = useCustomToast();
  const { mutateAsync: blockUser } = useBlockUser();
  const { mutateAsync: blockRss } = useBlockRss();
  const { mutate: reportUser, isPending: isReportPending } = useReportUser();
  const { data: ownedRss = [] } = useCertifiedRss(blockableUserId ?? 0);

  const extractErrorMessage = (error: unknown, fallback: string) =>
    (axios.isAxiosError(error) && (error.response?.data as { message?: string })?.message) || fallback;

  const handleBlock = async (block: { rssIds: number[] }) => {
    if (!blockableUserId) return;

    try {
      await blockUser(blockableUserId);
      const results = await Promise.allSettled(block.rssIds.map((rssId) => blockRss(rssId)));
      const failedRssCount = results.filter((result) => result.status === "rejected").length;
      if (failedRssCount > 0) {
        toast({
          title: "차단 완료",
          description: `${name}님을 차단했습니다. RSS ${failedRssCount}건은 차단하지 못했습니다.`,
        });
      } else {
        toast({ title: "차단 완료", description: `${name}님을 차단했습니다.` });
      }
    } catch (error) {
      toast({ title: "차단 실패", description: extractErrorMessage(error, "잠시 후 다시 시도해주세요.") });
    }
  };

  const handleReport = (payload: CreateReportPayload) => {
    if (!blockableUserId) return;
    reportUser(
      { userId: blockableUserId, payload },
      {
        onSuccess: () => {
          setShowReportDialog(false);
          toast({ title: "신고 접수 완료", description: "신고가 접수되었습니다." });
          setShowBlockConfirm(true);
        },
        onError: (error) => {
          toast({ title: "신고 실패", description: getReportErrorMessage(error, "유저를 찾을 수 없습니다.") });
        },
      }
    );
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="relative p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <Avatar className="flex-shrink-0 w-24 h-24 border-4 border-white shadow">
            {profileImage && <AvatarImage src={profileImage} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{name}</h1>
            {email && <p className="mt-1 text-gray-600">{email}</p>}
            <p className="mt-4 text-gray-800 whitespace-pre-wrap">
              {introduction ? introduction : <span className="text-gray-400">자기소개가 없습니다.</span>}
            </p>
          </div>
          {blockableUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="absolute right-4 top-4 sm:static flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="더보기"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Flag className="w-4 h-4 mr-2" />
                  신고하기
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setShowBlockConfirm(true)}>
                  <Ban className="w-4 h-4 mr-2" />
                  차단하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>

      <BlockConfirmDialog
        open={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        title={`${name} 유저를 차단하시겠습니까?`}
        description="댓글, 프로필 페이지 열람이 제한됩니다."
        ownedRss={ownedRss}
        onConfirm={handleBlock}
      />

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        title={`${name} 유저 신고`}
        isPending={isReportPending}
        onSubmit={handleReport}
      />
    </Card>
  );
};
