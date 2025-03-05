import React from "react";

import PostAvatar from "@/components/common/Card/PostAvatar";
import { SimpleTagList } from "@/components/common/Card/PostTag";

import { detailFormatDate } from "@/utils/date";

import { Post } from "@/types/post";

interface PostHeaderProps {
  data: Post;
}

export const PostHeader = React.memo(({ data }: PostHeaderProps) => (
  <div className="flex flex-col gap-2">
    <h1 className="text-[2rem] font-bold">{data.title}</h1>
    <span className="flex gap-2 items-center">
      <PostAvatar blogPlatform={data.blogPlatform} className="h-8 w-8" author={data.author} />
      <span className="flex flex-col">
        <span>{data.author}</span>
        <span className="flex gap-2 text-sm text-gray-400">
          <span>{detailFormatDate(data.createdAt)}</span>
          <span>·</span>
          <span>{data.viewCount} views</span>
        </span>
      </span>
    </span>
    <span>
      <SimpleTagList tags={data.tag} />
    </span>
  </div>
));

PostHeader.displayName = "PostHeader";
