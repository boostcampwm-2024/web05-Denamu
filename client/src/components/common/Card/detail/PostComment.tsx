import { useState } from "react";

import { Flag, MoreVertical } from "lucide-react";

import { AuthSignInForm } from "@/components/auth/AuthSignInForm";
import CommentAction from "@/components/common/Card/detail/CommentAction";
import { ReportDialog } from "@/components/common/ReportDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useNavigateToProfile } from "@/hooks/common/useNavigateToProfile";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useAdminDeleteComment,
} from "@/hooks/queries/useComments";
import { useUserProfile } from "@/hooks/queries/useProfile";
import { useReportComment } from "@/hooks/queries/useReport";

import { timeAgo } from "@/utils/timeago";

import { useAuthStore } from "@/store/useAuthStore";
import { FeedCommentType } from "@/types/post";
import { CreateReportPayload } from "@/types/report";

interface PostCommentProps {
  feedId: number;
  isFeedOwner?: boolean;
  isAdmin?: boolean;
}

interface CommentItemProps {
  comment: FeedCommentType;
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
  canReply?: boolean;
  isReply?: boolean;
  modifyId: number | null;
  handleModify: (id: number | null) => void;
  onUpdate: (commentId: number, newComment: string) => void;
  onDelete: (commentId: number) => void;
  onReply: (rootId: number, mention?: string) => void;
  onReport: (commentId: number) => void;
}

const INITIAL_VISIBLE = 3;

export default function PostComment({ feedId, isFeedOwner = false, isAdmin = false }: PostCommentProps) {
  const { id: userId, userName } = useAuthStore((state) => state.userInfo);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: comments = [] } = useComments(feedId);
  const { data: myProfile } = useUserProfile(userId ?? 0);
  const { mutate: createComment, isPending: isCreating } = useCreateComment(feedId);
  const { mutate: updateComment } = useUpdateComment(feedId);
  const { mutate: deleteCommentUser } = useDeleteComment(feedId);
  const { mutate: deleteCommentAdmin } = useAdminDeleteComment(feedId);
  const deleteComment = isAdmin ? deleteCommentAdmin : deleteCommentUser;
  const { mutate: reportComment, isPending: isReportPending } = useReportComment();
  const { toast } = useCustomToast();

  const [content, setContent] = useState("");
  const [modifyId, setModifyId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);

  const handleModify = (id: number | null) => setModifyId(id);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    const trimmed = content.trim();
    if (!trimmed || isCreating) return;
    createComment({ comment: trimmed }, { onSuccess: () => setContent("") });
  };

  const handleReplyOpen = (rootId: number, mention?: string) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    setReplyTo(rootId);
    setReplyContent(mention ? `@${mention} ` : "");
  };

  const handleReplySubmit = (rootId: number) => {
    const trimmed = replyContent.trim();
    if (!trimmed || isCreating) return;
    createComment(
      { comment: trimmed, parentId: rootId },
      {
        onSuccess: () => {
          setReplyTo(null);
          setReplyContent("");
        },
      },
    );
  };

  const handleUpdate = (commentId: number, newComment: string) => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    updateComment({ commentId, newComment: trimmed }, { onSuccess: () => setModifyId(null) });
  };

  const handleReportSubmit = (payload: CreateReportPayload) => {
    if (reportCommentId === null) return;
    reportComment(
      { commentId: reportCommentId, payload },
      {
        onSuccess: () => {
          setReportCommentId(null);
          toast({ title: "신고 접수 완료", description: "신고가 접수되었습니다." });
        },
        onError: () => {
          toast({ title: "신고 실패", description: "잠시 후 다시 시도해주세요." });
        },
      }
    );
  };

  const canEditComment = (comment: FeedCommentType) =>
    !isAdmin && !comment.isDeleted && comment.user.id === userId;
  const canDeleteComment = (comment: FeedCommentType) =>
    !comment.isDeleted && (isAdmin || comment.user.id === userId || isFeedOwner);
  const canReportComment = (comment: FeedCommentType) =>
    !isAdmin && isAuthenticated && !comment.isDeleted && comment.user.id !== userId;

  const repliesByParent = comments.reduce<Record<number, FeedCommentType[]>>((acc, comment) => {
    if (comment.parentId !== null) {
      (acc[comment.parentId] ??= []).push(comment);
    }
    return acc;
  }, {});
  Object.values(repliesByParent).forEach((replies) =>
    replies.sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date))),
  );

  const roots = comments
    .filter((comment) => comment.parentId === null)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
  const visibleRoots = showAll ? roots : roots.slice(0, INITIAL_VISIBLE);

  return (
    <div className="w-full space-y-6">
      {/* 댓글 입력 영역 */}
      {!isAdmin && (
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
      )}

      {/* 댓글 목록 헤더 */}
      <div className="flex items-center border-b border-gray-200 pb-2">
        <h3 className="font-bold text-lg">
          댓글 <span className="text-yellow-500">{comments.length}</span>
        </h3>
      </div>

      {/* 댓글 목록 */}
      <ul className="space-y-4">
        {visibleRoots.map((root) => (
          <li key={root.id} className="border-b border-gray-100 pb-4">
            <CommentItem
              comment={root}
              canEdit={canEditComment(root)}
              canDelete={canDeleteComment(root)}
              canReport={canReportComment(root)}
              canReply={!isAdmin}
              modifyId={modifyId}
              handleModify={handleModify}
              onUpdate={handleUpdate}
              onDelete={deleteComment}
              onReply={handleReplyOpen}
              onReport={setReportCommentId}
            />

            {/* 답글 목록 */}
            {(repliesByParent[root.id] ?? []).length > 0 && (
              <ul className="mt-3 ml-11 space-y-3 border-l-2 border-gray-100 pl-4">
                {repliesByParent[root.id].map((reply) => (
                  <li key={reply.id}>
                    <CommentItem
                      comment={reply}
                      canEdit={canEditComment(reply)}
                      canDelete={canDeleteComment(reply)}
                      canReport={canReportComment(reply)}
                      canReply={!isAdmin}
                      isReply
                      modifyId={modifyId}
                      handleModify={handleModify}
                      onUpdate={handleUpdate}
                      onDelete={deleteComment}
                      onReply={() => handleReplyOpen(root.id, reply.user.userName)}
                      onReport={setReportCommentId}
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* 답글 입력 영역 */}
            {replyTo === root.id && (
              <div className="mt-3 ml-11">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="w-full bg-gray-50 p-2 rounded-md h-16 outline-none ring-1 ring-gray-300 resize-none"
                ></textarea>
                <div className="flex justify-end gap-2 text-sm mt-1">
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent("");
                    }}
                    className="hover:bg-gray-200 py-1.5 px-3 rounded-lg"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleReplySubmit(root.id)}
                    disabled={isCreating}
                    className="bg-primary hover:bg-primary/90 py-1.5 px-3 text-white rounded-lg disabled:opacity-60"
                  >
                    답글 등록
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* 더보기 버튼 */}
      {!showAll && roots.length > INITIAL_VISIBLE && (
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

      <ReportDialog
        open={reportCommentId !== null}
        onOpenChange={(open) => !open && setReportCommentId(null)}
        title="댓글 신고"
        isPending={isReportPending}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

const CommentItem = ({
  comment,
  canEdit,
  canDelete,
  canReport,
  canReply = true,
  isReply = false,
  modifyId,
  handleModify,
  onUpdate,
  onDelete,
  onReply,
  onReport,
}: CommentItemProps) => {
  const [editContent, setEditContent] = useState(comment.comment);
  const isEditing = modifyId === comment.id;
  const navigateToProfile = useNavigateToProfile();

  const goToProfile = () => {
    if (comment.isDeleted) return;
    navigateToProfile(comment.user.id);
  };

  const avatarCursor = comment.isDeleted ? "" : "cursor-pointer";

  return (
    <div className="flex items-start gap-3">
      <Avatar className={`w-8 h-8 ${avatarCursor}`} onClick={goToProfile}>
        {!comment.isDeleted && (
          <AvatarImage src={comment.user.profileImage ?? undefined} alt={comment.user.userName} />
        )}
        <AvatarFallback>{comment.isDeleted ? "?" : comment.user.userName.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex justify-between w-full">
            <div className="flex gap-2 items-center">
              <p
                className={`font-semibold text-sm ${comment.isDeleted ? "text-gray-400" : "cursor-pointer hover:underline"}`}
                onClick={goToProfile}
              >
                {comment.user.userName}
              </p>
              <p className="text-sm text-gray-400">{timeAgo(comment.date)}</p>
            </div>
            {!isEditing && (
              <div className="flex items-center gap-1">
                {(canEdit || canDelete) && (
                  <CommentAction
                    id={comment.id}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    handleModify={handleModify}
                    onDelete={onDelete}
                  />
                )}
                {canReport && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center justify-center w-6 h-6 text-gray-400 rounded hover:bg-gray-100"
                        aria-label="댓글 옵션"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[1000]" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenuItem onClick={() => onReport(comment.id)}>
                        <Flag className="w-4 h-4 mr-2" />
                        신고하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>
        {!isEditing ? (
          <p className={`mt-1 ${comment.isDeleted ? "text-gray-400 italic" : "text-gray-800"}`}>{comment.comment}</p>
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
        {canReply && !isEditing && !comment.isDeleted && (
          <button
            onClick={() => onReply(comment.id, isReply ? comment.user.userName : undefined)}
            className="mt-1 text-xs text-gray-400 hover:text-gray-600"
          >
            답글
          </button>
        )}
      </div>
    </div>
  );
};
