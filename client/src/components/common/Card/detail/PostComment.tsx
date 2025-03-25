import { useState } from "react";

import { Heart } from "lucide-react";

import CommentAction from "@/components/common/Card/detail/CommentAction";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { timeAgo } from "@/utils/timeago";

import { PostCommentType } from "@/types/post";

type PostCommentProps = {
  comments: PostCommentType[];
};
export default function PostComment({ comments }: PostCommentProps) {
  const [modifyId, setModifyId] = useState<number | null>(null);
  const handleModify = (id: number | null) => {
    setModifyId(id);
  };
  return (
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
              className="flex-1 bg-transparent p-2 rounded-md h-20 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none"
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
          댓글 <span className="text-yellow-500">{comments.length}</span>
        </h3>
      </div>

      {/* 댓글 목록 */}
      <ul className="space-y-4">
        {comments
          .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
          .map((comment) => (
            <li key={comment.id} className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorImage} alt={comment.author} />
                  <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex justify-between w-full">
                      <div className="flex gap-2 items-center">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <p className="text-sm text-gray-400">{timeAgo(comment.createdAt)}</p>
                        <span className="flex text-[10px] items-center gap-1 border rounded-sm p-1 hover:bg-red-300">
                          <Heart size={15} color="red" fill={comment.isLiked ? `red` : "#fff"} />
                          {comment.likes}
                        </span>
                      </div>
                      {modifyId !== comment.id && <CommentAction id={comment.id} handleModify={handleModify} />}
                    </div>
                  </div>
                  {modifyId !== comment.id ? (
                    <p className="mt-1 text-gray-800">{comment.content}</p>
                  ) : (
                    <div className="">
                      <textarea className="w-[100%] mt-2 flex-1 bg-transparent p-2 rounded-md h-20 outline-none ring-2 ring-gray-300 border-transparent resize-none">
                        {comment.content}
                      </textarea>
                      <div className="flex justify-end gap-3 text-sm">
                        <button onClick={() => handleModify(null)} className="hover:bg-gray-200 py-2 px-4 rounded-lg">
                          취소
                        </button>
                        <button className="bg-primary hover:bg-primary/80 py-2 px-4 text-white  rounded-lg">
                          댓글 수정
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
      </ul>

      {/* 더보기 버튼 */}
      {comments.length > 1 && (
        <div className="flex justify-center">
          <button className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            댓글 더보기
          </button>
        </div>
      )}
    </div>
  );
}
