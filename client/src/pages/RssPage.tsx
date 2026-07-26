import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Ban, CalendarClock, CheckCircle2, ExternalLink, FileText, MoreVertical, Pencil, Users } from "lucide-react";

import { Footer } from "@/components/about/Footer";
import Layout from "@/components/layout/Layout";
import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton.tsx";
import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx";
import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { RssEditModal } from "@/components/profile/rss/RssEditModal.tsx";
import { RssFeedCard } from "@/components/profile/rss/RssFeedCard.tsx";
import { RssFeedRow } from "@/components/profile/rss/RssFeedRow.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

import NotFound from "@/pages/NotFound";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useBlockRss, useUnblockRss } from "@/hooks/queries/useBlock.ts";
import { useOwnedRssFeeds, useSetFeedVisibility } from "@/hooks/queries/useRssCertification.ts";
import {
  useRssActivities,
  useRssActivityYears,
  useRssInfo,
  useRssPageFeeds,
} from "@/hooks/queries/useRssPage.ts";

import { formatDate } from "@/utils/date.ts";

import { useAuthStore } from "@/store/useAuthStore";
import { RssInfo } from "@/types/profile.ts";

const OwnerFeedManager = ({ rssId }: { rssId: number }) => {
  const { toast } = useCustomToast();
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useOwnedRssFeeds(
    rssId,
    true
  );
  const visibilityMutation = useSetFeedVisibility(rssId, [
    ["rssInfo", rssId],
    ["rssPageFeeds", rssId],
  ]);

  const feeds = data?.pages.flatMap((page) => page.result) ?? [];

  const handleToggle = (feedId: number, next: boolean) => {
    visibilityMutation.mutate(
      { feedId, isPublic: next },
      { onError: () => toast({ title: "변경 실패", description: "다시 시도해주세요." }) }
    );
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">포스트 공개 관리</h3>
        {isLoading && <p className="text-sm text-gray-400">포스트를 불러오는 중...</p>}
        {isError && <p className="text-sm text-red-500">포스트를 불러오지 못했습니다.</p>}
        {!isLoading && !isError && feeds.length === 0 && (
          <p className="text-sm text-gray-400">등록된 포스트가 없습니다.</p>
        )}

        <ul className="space-y-2">
          {feeds.map((feed) => (
            <RssFeedRow
              key={feed.id}
              id={feed.id}
              title={feed.title}
              createdAt={feed.createdAt}
              commentCount={feed.commentCount}
              likeCount={feed.likeCount}
              isPublic={feed.isPublic}
              onToggleVisibility={(next) => handleToggle(feed.id, next)}
              toggleDisabled={visibilityMutation.isPending}
            />
          ))}
        </ul>

        {hasNextPage && (
          <div className="mt-3 text-center">
            <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BlockedRssView = ({ rssId }: { rssId: number }) => {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const { mutate: unblockRss, isPending } = useUnblockRss();

  const handleUnblock = () => {
    unblockRss(rssId, {
      onSuccess: () => {
        toast({ title: "차단 해제 완료", description: "차단이 해제되었습니다." });
      },
      onError: () => {
        toast({ title: "차단 해제 실패", description: "잠시 후 다시 시도해주세요." });
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <Ban className="w-12 h-12 mb-4 text-gray-400" />
      <h2 className="text-xl font-semibold text-gray-800">차단된 RSS입니다.</h2>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate("/")}>
          홈으로
        </Button>
        <Button onClick={handleUnblock} disabled={isPending}>
          차단 해제
        </Button>
      </div>
    </div>
  );
};

const RssHeader = ({ rss, onEdit, onBlock }: { rss: RssInfo; onEdit: () => void; onBlock?: () => void }) => (
  <Card className="mb-8">
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <PlatformIcon platform={rss.blogPlatform} image={rss.blogImage} className="flex-shrink-0 w-14 h-14" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold truncate">{rss.name}</h1>
              <BlogPlatformBadge platform={rss.blogPlatform} />
              {rss.owner && (
                <span
                  className="flex items-center gap-0.5 text-xs text-blue-500"
                  title="RSS 소유 인증 블로그"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  인증된 RSS
                </span>
              )}
            </div>
            <a
              href={rss.rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-sm text-gray-400 truncate hover:underline"
            >
              {rss.rssUrl}
            </a>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                포스트 {rss.feedCount}개
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                구독자 {rss.subscriberCount}명
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="w-4 h-4" />
                최근 포스트 {rss.lastPublishedAt ? formatDate(rss.lastPublishedAt) : "-"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 gap-1">
          <Button
            asChild
            className="gap-1.5 rounded-full bg-[#FF870D] font-semibold text-white hover:bg-[#e6790b]"
          >
            <a href={rss.blogUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              블로그 가기
            </a>
          </Button>
          {rss.isOwner ? (
            <Button variant="outline" className="gap-1" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
              정보 수정
            </Button>
          ) : (
            <SubscribeButton
              rssId={rss.id}
              isSubscribed={rss.isSubscribed}
              invalidateKeys={[["rssInfo", rss.id]]}
            />
          )}
          {onBlock && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="더보기"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onBlock}>
                  <Ban className="w-4 h-4 mr-2" />
                  차단하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const OwnerProfileCard = ({ owner }: { owner: NonNullable<RssInfo["owner"]> }) => {
  const initials = owner.userName ? owner.userName.substring(0, 2).toUpperCase() : "사용자";
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">소유자</h3>
        <Link
          to={`/profile/${owner.id}`}
          className="flex items-center gap-4 p-2 -m-2 transition-colors rounded-lg hover:bg-gray-50"
        >
          <Avatar className="w-12 h-12">
            {owner.profileImage && <AvatarImage src={owner.profileImage} alt={owner.userName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{owner.userName}</span>
        </Link>
      </CardContent>
    </Card>
  );
};

const MAX_YEARS = 5;

export default function RssPage() {
  const { rssId } = useParams();
  const numericId = Number(rssId);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { toast } = useCustomToast();
  const { mutate: blockRss } = useBlockRss();

  const { data: rss, isLoading, isError } = useRssInfo(numericId);
  const {
    data: feedData,
    isLoading: feedsLoading,
    isError: feedsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRssPageFeeds(numericId, selectedDate ?? undefined);
  const { data: activityYears = [] } = useRssActivityYears(numericId);
  const { data: activity } = useRssActivities(numericId, year);

  const [editOpen, setEditOpen] = useState(false);

  const years = Array.from({ length: MAX_YEARS }, (_, i) => currentYear - i).filter(
    (y) => y === currentYear || activityYears.includes(y)
  );

  if (!rssId || !/^\d+$/.test(rssId)) {
    return <NotFound />;
  }
  if (isLoading) {
    return null;
  }
  if (isError || !rss) {
    return <NotFound />;
  }

  if (rss.isBlocked) {
    return (
      <>
        <Layout>
          <BlockedRssView rssId={rss.id} />
        </Layout>
        <Footer />
      </>
    );
  }

  const feeds = feedData?.pages.flatMap((page) => page.result) ?? [];

  const handleBlock = () => {
    blockRss(rss.id, {
      onSuccess: () => {
        toast({ title: "차단 완료", description: `${rss.name} RSS를 차단했습니다.` });
      },
      onError: () => {
        toast({ title: "차단 실패", description: "잠시 후 다시 시도해주세요." });
      },
    });
    setShowBlockConfirm(false);
  };

  const handleYearChange = (nextYear: number) => {
    setSelectedDate(null); // 다른 연도로 이동하면 선택한 잔디 칸이 사라지므로 필터 해제
    setYear(nextYear);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  };

  return (
    <>
      <Layout>
        <div className="max-w-4xl px-4 py-8 mx-auto md:px-8">
          <RssHeader
            rss={rss}
            onEdit={() => setEditOpen(true)}
            onBlock={isAuthenticated && !rss.isOwner ? () => setShowBlockConfirm(true) : undefined}
          />

          {rss.owner && <OwnerProfileCard owner={rss.owner} />}

          {rss.isOwner && (
            <>
              <OwnerFeedManager rssId={rss.id} />
              <RssEditModal
                target={editOpen ? rss : null}
                userId={rss.owner?.id ?? 0}
                onClose={() => setEditOpen(false)}
                extraInvalidateKeys={[["rssInfo", rss.id]]}
              />
            </>
          )}

          <Card className="mb-8">
            <CardContent className="p-6">
              <ActivityGraph
                dailyActivities={activity?.dailyActivities ?? []}
                year={year}
                years={years}
                onYearChange={handleYearChange}
                scale="posts"
                selectedDate={selectedDate}
                onDayClick={handleDayClick}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">
                포스트
                {selectedDate && (
                  <span className="ml-2 text-sm font-normal text-gray-500">{selectedDate} 발행분</span>
                )}
              </h3>
              {feedsLoading && <p className="text-sm text-gray-400">포스트를 불러오는 중...</p>}
              {feedsError && <p className="text-sm text-red-500">포스트를 불러오지 못했습니다.</p>}
              {!feedsLoading && !feedsError && feeds.length === 0 && (
                <p className="text-sm text-gray-400">포스트가 없습니다.</p>
              )}

              <ul className="space-y-3">
                {feeds.map((feed) => (
                  <RssFeedCard
                    key={feed.id}
                    id={feed.id}
                    title={feed.title}
                    thumbnail={feed.thumbnail}
                    createdAt={feed.createdAt}
                    commentCount={feed.commentCount}
                    likeCount={feed.likeCount}
                  />
                ))}
              </ul>

              {hasNextPage && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{rss.name} RSS를 차단하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>게시글 및 RSS 프로필 페이지 조회가 제한됩니다.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleBlock}>
                차단
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
      <Footer />
    </>
  );
}
