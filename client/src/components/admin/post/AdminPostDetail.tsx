import { useRef } from "react";

import { X } from "lucide-react";
import Markdown from "react-markdown";

import PostComment from "@/components/common/Card/detail/PostComment";
import { PostHeader } from "@/components/common/Card/detail/PostHeader";

import { usePostDetail } from "@/hooks/queries/usePostDetail";

interface AdminPostDetailProps {
  feedId: number;
  onClose: () => void;
}

export default function AdminPostDetail({ feedId, onClose }: AdminPostDetailProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { data } = usePostDetail(feedId);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (!data) return null;
  const post = data.data;
  const markdownString = (post.summary ?? "").replace(/\\n/g, "\n").replace(/\\r/g, "\r");

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start z-[999] overflow-y-auto py-10"
      onClick={handleClickOutside}
    >
      <div ref={modalRef} className="bg-white rounded-md w-[90%] max-w-4xl h-auto relative">
        <div className="w-full border-b flex justify-end">
          <button onClick={onClose} className="rounded my-5 mx-5" aria-label="Close modal">
            <X size={15} />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-5 px-10 pb-10">
          <PostHeader data={post} />
          <div className="prose max-w-full border-b pb-5">
            <Markdown>{markdownString}</Markdown>
            {post.summary && (
              <p className="text-gray-400">💡 인공지능이 요약한 내용입니다. 오류가 포함될 수 있으니 참고 바랍니다.</p>
            )}
          </div>
          <PostComment feedId={post.id} isAdmin />
        </div>
      </div>
    </div>
  );
}
