import { useState } from "react";

import CommentAction from "@/components/common/Card/detail/CommentAction";
import { AuthSignInForm } from "@/components/auth/AuthSignInForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/queries/useComments";
import { useUserProfile } from "@/hooks/queries/useProfile";

import { useAuthStore } from "@/store/useAuthStore";
import { PostCommentType } from "@/types/post";
import { timeAgo } from "@/utils/timeago";

interface PostCommentProps {
  feedId: number;
}

interface CommentItemProps {
  comment: PostCommentType;
  isOwner: boolean;
  modifyId: number | null;
  handleModify: (id: number | null) => void;
  onUpdate: (commentId: number, newComment: string) => void;
  onDelete: (commentId: number) => void;
}

const INITIAL_VISIBLE = 3;

export default function PostComment({ feedId }: PostCommentProps) {
  const { id: userId, userName } = useAuthStore((state) => state.userInfo);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: comments = [] } = useComments(feedId);
  const { data: myProfile } = useUserProfile(userId ?? 0);
  const { mutate: createComment, isPending: isCreating } = useCreateComment(feedId);
  const { mutate: updateComment } = useUpdateComment(feedId);
  const { mutate: deleteComment } = useDeleteComment(feedId);

  const [content, setContent] = useState("");
  const [modifyId, setModifyId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleModify = (id: number | null) => setModifyId(id);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    const trimmed = content.trim();
    if (!trimmed || isCreating) return;
    createComment(trimmed, { onSuccess: () => setContent("") });
  };

  const handleUpdate = (commentId: number, newComment: string) => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    updateComment({ commentId, newComment: trimmed }, { onSuccess: () => setModifyId(null) });
  };

  const sorted = [...comments].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);

  return (
    <div className="w-full space-y-6">
      {/* 댓글 입력 영역 */}
      <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={myProfile?.profileImage ?? undefined} alt={userName ?? "사용자 프로필"} />
              <AvatarFallback>{(myProfile?.userName ?? userName ?? "?").substring(0, 2)}</AvatarFallback>
            </Avatar>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-transparent p-2 rounded-md h-20 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end px-4 pb-4">
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-full transition-colors disabled:opacity-60"
          >
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
        {visible.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isOwner={comment.user.id === userId}
            modifyId={modifyId}
            handleModify={handleModify}
            onUpdate={handleUpdate}
            onDelete={deleteComment}
          />
        ))}
      </ul>

      {/* 더보기 버튼 */}
      {!showAll && sorted.length > INITIAL_VISIBLE && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm text-black hover:bg-gray-200 transition-colors"
          >
            댓글 더보기
          </button>
        </div>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogContent className="z-[1000] max-w-md border-0 bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">로그인</DialogTitle>
            <AuthSignInForm hideBackButton onSuccess={() => setLoginOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const CommentItem = ({ comment, isOwner, modifyId, handleModify, onUpdate, onDelete }: CommentItemProps) => {
  const [editContent, setEditContent] = useState(comment.comment);
  const isEditing = modifyId === comment.id;

  return (
    <li className="border-b border-gray-100 pb-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.user.profileImage ?? undefined} alt={comment.user.userName} />
          <AvatarFallback>{comment.user.userName.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex justify-between w-full">
              <div className="flex gap-2 items-center">
                <p className="font-semibold text-sm">{comment.user.userName}</p>
                <p className="text-sm text-gray-400">{timeAgo(comment.date)}</p>
              </div>
              {isOwner && !isEditing && (
                <CommentAction id={comment.id} handleModify={handleModify} onDelete={onDelete} />
              )}
            </div>
          </div>
          {!isEditing ? (
            <p className="mt-1 text-gray-800">{comment.comment}</p>
          ) : (
            <div className="">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-[100%] mt-2 flex-1 bg-transparent p-2 rounded-md h-20 outline-none ring-2 ring-gray-300 border-transparent resize-none"
              ></textarea>
              <div className="flex justify-end gap-3 text-sm">
                <button onClick={() => handleModify(null)} className="hover:bg-gray-200 py-2 px-4 rounded-lg">
                  취소
                </button>
                <button
                  onClick={() => onUpdate(comment.id, editContent)}
                  className="bg-primary hover:bg-primary/80 py-2 px-4 text-white rounded-lg"
                >
                  댓글 수정
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};
