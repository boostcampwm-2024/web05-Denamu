import React from "react";
import Markdown from "react-markdown";

import LikeButton from "@/components/common/Card/detail/LikeButton";
import ShareButton from "@/components/common/Card/detail/ShareButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { usePostCardActions } from "@/hooks/common/usePostCardActions";

import { POST_COMMENT_DATA } from "@/constants/dummyData";

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
              src={`https://denamu.dev/files/${post.blogPlatform}-icon.svg`}
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
      <div className="flex gap-3 border-b pb-5">
        <LikeButton post={post} />
        <ShareButton post={post} />
      </div>
      <div className="w-full  space-y-6">
        {/* 댓글 입력 영역 */}
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://github.com/shadcn.png" alt="사용자 프로필" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <textarea
                placeholder="댓글을 입력하세요..."
                className="flex-1 bg-transparent p-2 rounded-md h-20 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end px-4 pb-4">
            <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-full transition-colors">
              등록
            </button>
          </div>
        </div>

        {/* 댓글 목록 헤더 */}
        <div className="flex items-center border-b border-gray-200 pb-2">
          <h3 className="font-bold text-lg">
            댓글 <span className="text-yellow-500">{POST_COMMENT_DATA.length}</span>
          </h3>
        </div>

        {/* 댓글 목록 */}
        <ul className="space-y-4">
          {POST_COMMENT_DATA.map((comment) => (
            <li key={comment.id} className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorImage} alt={comment.author} />
                  <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{comment.author}</p>
                  </div>
                  <p className="mt-1 text-gray-800">{comment.content}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* 더보기 버튼 */}
        {POST_COMMENT_DATA.length > 3 && (
          <div className="flex justify-center">
            <button className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              댓글 더보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

PostContent.displayName = "PostContent";
