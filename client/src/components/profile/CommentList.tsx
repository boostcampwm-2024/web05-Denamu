import { Link } from "react-router-dom";

import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useUserComments } from "@/hooks/queries/useProfile.ts";

interface CommentListProps {
  userId: number;
}

export const CommentList = ({ userId }: CommentListProps) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useUserComments(userId);

  const items = data?.pages.flatMap((page) => page.result) ?? [];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">작성한 댓글</h3>

        {isLoading && <p className="text-sm text-gray-400">불러오는 중...</p>}
        {isError && <p className="text-sm text-red-500">목록을 불러오지 못했습니다.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-gray-400">작성한 댓글이 없습니다.</p>
        )}

        <ul className="space-y-3">
          {items.map((comment) => (
            <li key={comment.id} className="p-3 border-0 md:border border-gray-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <MessageSquare className="flex-shrink-0 w-4 h-4 mt-1 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 break-words">{comment.comment}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Link to={`/${comment.feed.id}`} className="text-sm text-blue-600 truncate hover:underline">
                      {comment.feed.title}
                    </Link>
                    <span className="flex-shrink-0 ml-3 text-sm text-gray-400">
                      {new Date(comment.date).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {hasNextPage && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
