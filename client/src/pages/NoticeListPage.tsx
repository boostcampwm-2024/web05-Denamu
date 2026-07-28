import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import { Pin } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useNotices } from "@/hooks/queries/useNotices";

const PAGE_SIZE = 10;

export default function NoticeListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotices({ page, limit: PAGE_SIZE });
  const navigate = useNavigate();

  const notices = data?.result ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <Layout>
      <Helmet>
        <title>공지사항 - 데나무</title>
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">공지사항</h1>

        <div className="mt-6 divide-y border-t border-b">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-red-500">공지사항을 불러오지 못했습니다.</p>
          ) : notices.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">등록된 공지사항이 없습니다.</p>
          ) : (
            notices.map((notice) => (
              <button
                key={notice.id}
                onClick={() => navigate(`/notice/${notice.id}`)}
                className="flex w-full items-center gap-3 py-4 text-left hover:bg-accent"
              >
                {notice.isPinned && (
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Pin className="h-3 w-3" />
                    고정
                  </Badge>
                )}
                <span className="flex-1 truncate font-medium">{notice.title}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
