import React from "react";
import Markdown from "react-markdown";

import LikeButton from "@/components/common/Card/detail/LikeButton";
import ShareButton from "@/components/common/Card/detail/ShareButton";

import { usePostCardActions } from "@/hooks/common/usePostCardActions";

import { useMediaStore } from "@/store/useMediaStore";
import { Post } from "@/types/post";

interface PostContentProps {
  post: Post;
}

export const PostContent = React.memo(({ post }: PostContentProps) => {
  const summary = post.summary;
  const markdownString = (summary ?? "").replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  const isMobile = useMediaStore((state) => state.isMobile);
  const { openPost } = usePostCardActions(post);
  return (
    <div className="flex flex-col gap-5 mb-10">
      <div
        className="md:grid md:grid-cols-5 md:gap-4 items-center border rounded-md shadow-sm transition-transform duration-300 hover:scale-[1.02]  "
        role="button"
        onClick={() => openPost({ post })}
      >
        <div className="md:col-span-3 flex flex-col h-full justify-between p-4 bg-white ">
          <span className="text-lg font-semibold">{post.title}</span>
          <span className="text-sm text-gray-400 hover:underline flex gap-2 truncate">
            <img
              src={`https://denamu.site/files/${post.blogPlatform}-icon.svg`}
              alt={post.author}
              className="h-5 w-5 rounded-none"
            />
            {post.path}
          </span>
        </div>
        {!isMobile && (
          <img
            src={post.thumbnail}
            alt={`Thumbnail for ${post.title}`}
            className="w-full max-h-[200px] object-cover col-span-2 "
          />
        )}
      </div>

      <div className="prose max-w-full border-b pb-5">
        <Markdown>{markdownString}</Markdown>
        {summary && (
          <p className="text-gray-400">💡 인공지능이 요약한 내용입니다. 오류가 포함될 수 있으니 참고 바랍니다.</p>
        )}
      </div>
      <div className="flex gap-3">
        <LikeButton />
        <ShareButton post={post} />
      </div>
    </div>
  );
});

PostContent.displayName = "PostContent";
