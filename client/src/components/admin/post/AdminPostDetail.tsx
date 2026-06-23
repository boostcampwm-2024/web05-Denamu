import { useRef } from "react";

import { AxiosError } from "axios";
import { Heart, MessageSquare, Sparkles, X } from "lucide-react";
import Markdown from "react-markdown";

import PostComment from "@/components/common/Card/detail/PostComment";
import { PostHeader } from "@/components/common/Card/detail/PostHeader";
import { Button } from "@/components/ui/button";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { usePostDetail } from "@/hooks/queries/usePostDetail";
import { NO_SUMMARY_FEEDS_KEY, useRequestAiSummary } from "@/hooks/queries/useAiSummaryRequest";
import { useQueryClient } from "@tanstack/react-query";

interface AdminPostDetailProps {
  feedId: number;
  onClose: () => void;
}

export default function AdminPostDetail({ feedId, onClose }: AdminPostDetailProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { data } = usePostDetail(feedId);
  const { toast } = useCustomToast();
  const queryClient = useQueryClient();
  const { mutate: requestSummary, isPending } = useRequestAiSummary();

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (!data) return null;
  const post = data.data;
  const markdownString = (post.summary ?? "").replace(/\\n/g, "\n").replace(/\\r/g, "\r");

  const handleRetry = () => {
    if (isPending) return;
    requestSummary(post.id, {
      onSuccess: () => {
        toast({ title: "AI 요약 재요청 접수", description: "요약 재생성이 접수되었습니다." });
        queryClient.invalidateQueries({ queryKey: NO_SUMMARY_FEEDS_KEY });
      },
      onError: (error) => {
        const message =
          (error as AxiosError<{ message?: string }>).response?.data?.message ?? "다시 시도해주세요.";
        toast({ title: "AI 요약 재요청 실패", description: message });
      },
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start z-[999] overflow-y-auto py-10"
      onClick={handleClickOutside}
    >
      <div ref={modalRef} className="bg-white rounded-md w-[90%] max-w-4xl h-auto relative">
        <div className="w-full border-b flex justify-between items-center px-5 py-4">
          <Button size="sm" onClick={handleRetry} disabled={isPending} className="gap-1">
            <Sparkles size={14} />
            {isPending ? "재요청 중..." : "AI 요약 재시도"}
          </Button>
          <button onClick={onClose} className="rounded" aria-label="Close modal">
            <X size={15} />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-5 px-10 pb-10">
          <PostHeader data={post} />
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Heart size={16} /> 공감 {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={16} /> 댓글 {post.comments}
            </span>
          </div>
          <div className="prose max-w-full border-b pb-5">
            <Markdown>{markdownString}</Markdown>
            {post.summary ? (
              <p className="text-gray-400">💡 인공지능이 요약한 내용입니다. 오류가 포함될 수 있으니 참고 바랍니다.</p>
            ) : (
              <p className="text-gray-400">아직 AI 요약이 없습니다. 상단의 “AI 요약 재시도” 버튼으로 재생성할 수 있습니다.</p>
            )}
          </div>
          <PostComment feedId={post.id} isAdmin />
        </div>
      </div>
    </div>
  );
}
