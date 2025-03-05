import { useRef } from "react";
import { useParams } from "react-router-dom";

import { PostContent } from "@/components/common/Card/detail/PostContent";
import { PostHeader } from "@/components/common/Card/detail/PostHeader";
import Header from "@/components/layout/Header";

import Loading from "@/pages/Loading";
import NotFound from "@/pages/NotFound";

import { usePostDetail } from "@/hooks/queries/usePostDetail";

export default function PostDetailPage() {
  const { id } = useParams();
  if (id && !/^\d+$/.test(id)) {
    return <NotFound />;
  }

  const { data, isLoading, error } = usePostDetail(Number(id));
  const modalRef = useRef<HTMLDivElement>(null);
  if (isLoading) {
    return <Loading />;
  }
  if (error || !data) {
    return <NotFound />;
  }

  return (
    <div ref={modalRef} className="bg-white overflow-y-auto relative">
      <Header />
      <div className="mt-5 px-10 md:px-40 flex flex-col gap-2 max-w-7xl mx-auto">
        <PostHeader data={data.data} />
        <PostContent post={data.data} />
      </div>
    </div>
  );
}
