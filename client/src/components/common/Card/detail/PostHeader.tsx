import React from "react";

import { CheckCircle2 } from "lucide-react";

import PostAvatar from "@/components/common/Card/PostAvatar";
import { SimpleTagList } from "@/components/common/Card/PostTag";
import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton";

import { detailFormatDate } from "@/utils/date";

import { FeedDetail } from "@/types/post";

interface PostHeaderProps {
  data: FeedDetail;
}

export const PostHeader = React.memo(({ data }: PostHeaderProps) => (
  <div className="flex flex-col gap-2">
    <h1 className="text-[2rem] font-bold">{data.title}</h1>
    <span className="flex gap-2 items-center">
      <PostAvatar blogPlatform={data.blogPlatform} className="h-8 w-8" author={data.author} />
      <span className="flex flex-col min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="font-medium truncate">{data.author}</span>
          {data.isOwnerCertified && (
            <span className="flex items-center gap-0.5 text-xs text-blue-500" title="RSS 소유 인증 블로그">
              <CheckCircle2 className="w-4 h-4" />
              인증
            </span>
          )}
        </span>
        <span className="flex gap-2 text-sm text-gray-400">
          {data.ownerName && (
            <>
              <span>{data.ownerName}</span>
              <span>·</span>
            </>
          )}
          <span>{detailFormatDate(data.createdAt)}</span>
          <span>·</span>
          <span>{data.viewCount} views</span>
        </span>
      </span>
      {data.blogId != null && !data.isOwner && (
        <span className="ml-auto flex-shrink-0">
          <SubscribeButton rssId={data.blogId} isSubscribed={data.isSubscribed} invalidateKeys={[["getDetail", data.id]]} />
        </span>
      )}
    </span>
    <span>
      <SimpleTagList tags={data.tag} />
    </span>
  </div>
));

PostHeader.displayName = "PostHeader";
