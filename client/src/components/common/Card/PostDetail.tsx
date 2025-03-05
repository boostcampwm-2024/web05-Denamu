import React, { useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { X } from "lucide-react";

import { FixedHeader } from "@/components/common/Card/detail/FixedHeader";
import { PostContent } from "@/components/common/Card/detail/PostContent";
import { PostHeader } from "@/components/common/Card/detail/PostHeader";

import NotFound from "@/pages/NotFound";

import { useHeaderVisibility } from "@/hooks/common/useHeaderVisibility";
import { useScrollbarAdjustment } from "@/hooks/common/useScrollbarAdjustment";
import { usePostDetail } from "@/hooks/queries/usePostDetail";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const { data } = usePostDetail(Number(id));
  const scrollbarWidth = useScrollbarAdjustment();
  const [modalRoot, setModalRoot] = useState<Element | null>(null);
  const modalContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setModalRoot(node);
    }
  }, []);

  const { headerRef, isHeaderVisible } = useHeaderVisibility(modalRoot);

  const closeDetail = React.useCallback(() => navigate(-1), [navigate]);

  const handleClickOutside = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeDetail();
      }
    },
    [closeDetail]
  );

  if (id && !/^\d+$/.test(id)) {
    return <NotFound />;
  }
  if (!data) {
    return;
  }
  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 bg-black/50 flex justify-center items-start z-[999] overflow-y-auto py-10"
      onClick={handleClickOutside}
    >
      <div ref={modalRef} className="bg-white rounded-md w-[90%] max-w-4xl h-auto relative">
        {!isHeaderVisible && (
          <FixedHeader title={data.data.title} onClose={closeDetail} scrollbarWidth={scrollbarWidth} />
        )}

        <div ref={headerRef} className="w-full border-b flex justify-end">
          <button onClick={closeDetail} className="rounded my-5 mx-5" aria-label="Close modal">
            <X size={15} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2 px-10 ">
          <PostHeader data={data.data} />
          <PostContent post={data.data} />
        </div>
      </div>
    </div>
  );
}
