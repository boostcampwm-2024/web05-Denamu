import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import { Pin } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useBoards } from "@/hooks/queries/useBoards";
import { BoardCategory } from "@/types/board";

const PAGE_SIZE = 10;

const CATEGORY_TABS: { label: string; value: BoardCategory }[] = [
  { label: "공지사항", value: "NOTICE" },
  { label: "FAQ", value: "FAQ" },
];

const EMPTY_MESSAGES: Record<BoardCategory, string> = {
  NOTICE: "등록된 공지사항이 없습니다.",
  FAQ: "등록된 FAQ가 없습니다.",
};

const ERROR_MESSAGES: Record<BoardCategory, string> = {
  NOTICE: "공지사항을 불러오지 못했습니다.",
  FAQ: "FAQ를 불러오지 못했습니다.",
};

export default function BoardListPage() {
  const [category, setCategory] = useState<BoardCategory>("NOTICE");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useBoards({ page, limit: PAGE_SIZE, category });
  const navigate = useNavigate();

  const boards = data?.result ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <Layout>
      <Helmet>
        <title>공지사항 · FAQ - 데나무</title>
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">공지사항 · FAQ</h1>

        <Tabs
          value={category}
          onValueChange={(value) => {
            setCategory(value as BoardCategory);
            setPage(1);
          }}
          className="mt-6"
        >
          <TabsList>
            {CATEGORY_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-4 divide-y border-t border-b">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-red-500">{ERROR_MESSAGES[category]}</p>
          ) : boards.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">{EMPTY_MESSAGES[category]}</p>
          ) : (
            boards.map((board) => (
              <button
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="flex w-full items-center gap-3 py-4 text-left hover:bg-accent"
              >
                {board.isPinned && (
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Pin className="h-3 w-3" />
                    고정
                  </Badge>
                )}
                <span className="flex-1 truncate font-medium">{board.title}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {new Date(board.createdAt).toLocaleDateString()}
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
