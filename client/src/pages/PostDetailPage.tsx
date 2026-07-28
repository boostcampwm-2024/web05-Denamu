import { useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

import { BlockedFeedNotice } from "@/components/common/Card/detail/BlockedFeedNotice";
import { PostContent } from "@/components/common/Card/detail/PostContent";
import { PostHeader } from "@/components/common/Card/detail/PostHeader";
import Header from "@/components/layout/Header";

import Loading from "@/pages/Loading";
import NotFound from "@/pages/NotFound";

import { useIncrementViewByPostId } from "@/hooks/common/usePostCardActions";
import { usePostDetail } from "@/hooks/queries/usePostDetail";

export default function PostDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const highlightCommentId = (location.state as { highlightCommentId?: number | null } | null)
    ?.highlightCommentId;

  const numericId = Number(id);
  const increment = useIncrementViewByPostId(numericId);
  const { data, isLoading, error } = usePostDetail(numericId);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    increment();
  }, [id]);

  if (!id || !/^\d+$/.test(id)) {
    return <NotFound />;
  }

  if (isLoading) {
    return <Loading />;
  }
  if (error || !data) {
    return <NotFound />;
  }

  if (data.data.isBlocked) {
    return (
      <div className="bg-white overflow-y-auto relative">
        <Header />
        <BlockedFeedNotice />
      </div>
    );
  }

  return (
    <div ref={modalRef} className="bg-white overflow-y-auto relative">
      <Header />
      <div className="mt-5 px-10 md:px-40 flex flex-col gap-2 max-w-7xl mx-auto">
        <PostHeader data={data.data} />
        <PostContent post={data.data} highlightCommentId={highlightCommentId} />
      </div>
    </div>
  );
}
