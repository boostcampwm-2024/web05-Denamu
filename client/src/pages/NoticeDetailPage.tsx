import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { NoticeContent } from "@/components/notice/NoticeContent";
import { Button } from "@/components/ui/button";

import { useNotice } from "@/hooks/queries/useNotices";

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const noticeId = id ? Number(id) : null;
  const { data: notice, isLoading, isError } = useNotice(noticeId);

  return (
    <Layout>
      <Helmet>
        <title>{notice ? `${notice.title} - 공지사항` : "공지사항"} - 데나무</title>
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-0 text-xs text-gray-400"
          onClick={() => navigate("/notice")}
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : isError || !notice ? (
          <p className="py-12 text-center text-sm text-red-500">존재하지 않거나 접근할 수 없는 공지사항입니다.</p>
        ) : (
          <article className="mt-4">
            <h1 className="text-2xl font-bold">{notice.title}</h1>
            <p className="mt-2 text-sm text-gray-400">{new Date(notice.createdAt).toLocaleString()}</p>
            <div className="mt-6 border-t pt-6">
              <NoticeContent content={notice.content} />
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
}
