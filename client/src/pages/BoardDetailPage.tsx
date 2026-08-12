import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { BoardContent } from "@/components/board/BoardContent";
import { Button } from "@/components/ui/button";

import { useBoard } from "@/hooks/queries/useBoards";
import { BoardCategory } from "@/types/board";

const CATEGORY_LABELS: Record<BoardCategory, string> = {
  NOTICE: "공지사항",
  FAQ: "FAQ",
};

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boardId = id ? Number(id) : null;
  const { data: board, isLoading, isError } = useBoard(boardId);
  const categoryLabel = board ? CATEGORY_LABELS[board.category] : "공지사항 · FAQ";

  return (
    <Layout footer>
      <Helmet>
        <title>{board ? `${board.title} - ${categoryLabel}` : "공지사항 · FAQ"} - 데나무</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-0 text-xs text-gray-400"
          onClick={() => navigate("/board")}
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : isError || !board ? (
          <p className="py-12 text-center text-sm text-red-500">존재하지 않거나 접근할 수 없습니다.</p>
        ) : (
          <article className="mt-4">
            <h1 className="text-2xl font-bold">{board.title}</h1>
            <p className="mt-2 text-sm text-gray-400">
              {board.authorName && <span>{board.authorName} · </span>}
              {new Date(board.createdAt).toLocaleString()}
            </p>
            {board.category === "FAQ" && board.question ? (
              <div className="mt-6 flex flex-col gap-8 border-t pt-6">
                <div className="flex gap-4">
                  <span className="text-3xl font-black leading-none text-green-500">Q</span>
                  <div className="flex-1 pt-1">
                    <BoardContent content={board.question} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl font-black leading-none text-blue-500">A</span>
                  <div className="flex-1 pt-1">
                    <BoardContent content={board.content} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 border-t pt-6">
                <BoardContent content={board.content} />
              </div>
            )}
          </article>
        )}
      </div>
    </Layout>
  );
}
