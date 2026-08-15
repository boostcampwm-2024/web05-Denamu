import { Link } from "react-router-dom";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useUserLikes } from "@/hooks/queries/useProfile.ts";

interface LikedListProps {
  userId: number;
}

export const LikedList = ({ userId }: LikedListProps) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useUserLikes(userId);

  const items = data?.pages.flatMap((page) => page.result) ?? [];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">좋아요한 게시글</h3>

        {isLoading && <p className="text-sm text-gray-400">불러오는 중...</p>}
        {isError && <p className="text-sm text-red-500">목록을 불러오지 못했습니다.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-gray-400">좋아요한 게시글이 없습니다.</p>
        )}

        <ul className="space-y-3">
          {items.map((like) => (
            <li key={like.id}>
              <Link
                to={`/${like.feed.id}`}
                className="flex items-center justify-between p-3 border-0 md:border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center min-w-0 space-x-3">
                  <Heart className="flex-shrink-0 w-4 h-4 text-red-500" />
                  <span className="truncate">{like.feed.title}</span>
                </div>
                <span className="flex-shrink-0 ml-3 text-sm text-gray-400">
                  {new Date(like.likeDate).toLocaleDateString("ko-KR")}
                </span>
              </Link>
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
