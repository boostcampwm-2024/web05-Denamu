import React, { useState } from "react";
import { Link } from "react-router-dom";

import { CheckCircle2, Flag, MoreVertical } from "lucide-react";

import PostAvatar from "@/components/common/Card/PostAvatar";
import { SimpleTagList } from "@/components/common/Card/PostTag";
import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton";
import { ReportDialog } from "@/components/common/ReportDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useReportFeed } from "@/hooks/queries/useReport";

import { detailFormatDate } from "@/utils/date";

import { useAuthStore } from "@/store/useAuthStore";
import { FeedDetail } from "@/types/post";
import { CreateReportPayload } from "@/types/report";

interface PostHeaderProps {
  data: FeedDetail;
}

export const PostHeader = React.memo(({ data }: PostHeaderProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { toast } = useCustomToast();
  const { mutate: reportFeed, isPending: isReportPending } = useReportFeed();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleReport = (payload: CreateReportPayload) => {
    reportFeed(
      { feedId: data.id, payload },
      {
        onSuccess: () => {
          setShowReportDialog(false);
          toast({ title: "신고 접수 완료", description: "신고가 접수되었습니다." });
        },
        onError: () => {
          toast({ title: "신고 실패", description: "잠시 후 다시 시도해주세요." });
        },
      }
    );
  };

  const profileContent = (
    <>
      <PostAvatar
        blogPlatform={data.blog.platform}
        blogImage={data.blog.image}
        className="h-8 w-8"
        author={data.author}
      />
      <span className="flex flex-col min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="font-medium truncate">{data.author}</span>
          {data.blog.isOwnerCertified && (
            <span className="flex items-center gap-0.5 text-xs text-blue-500" title="RSS 소유 인증 블로그">
              <CheckCircle2 className="w-4 h-4" />
              인증
            </span>
          )}
        </span>
        <span className="flex gap-2 text-sm text-gray-400">
          {data.blog.ownerName && (
            <>
              <span>{data.blog.ownerName}</span>
              <span>·</span>
            </>
          )}
          <span>{detailFormatDate(data.createdAt)}</span>
          <span>·</span>
          <span>{data.viewCount} views</span>
        </span>
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-[2rem] font-bold">{data.title}</h1>
        {isAuthenticated && !data.isOwner && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="더보기"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[1000]" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="w-4 h-4 mr-2" />
                신고하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <span className="flex gap-2 items-center">
        <Link
          to={`/rss/${data.blog.id}`}
          className="flex gap-2 items-center min-w-0 transition-opacity hover:opacity-80"
        >
          {profileContent}
        </Link>
        {!data.isOwner && (
          <span className="ml-auto flex-shrink-0">
            <SubscribeButton
              rssId={data.blog.id}
              isSubscribed={data.isSubscribed}
              invalidateKeys={[["getDetail", data.id]]}
            />
          </span>
        )}
      </span>
      <span>
        <SimpleTagList tags={data.tag} />
      </span>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        title="게시글 신고"
        isPending={isReportPending}
        onSubmit={handleReport}
      />
    </div>
  );
});

PostHeader.displayName = "PostHeader";
