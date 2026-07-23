import { Link, useLocation } from "react-router-dom";

import { Rss } from "lucide-react";

import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";

import { useIncrementViewByPostId } from "@/hooks/common/usePostCardActions";

import { DEFAULT_BADGE_COLOR, PLATFORM_BADGE_COLORS } from "@/constants/rss";
import { RecentRss } from "@/types/rss";

import { useRecentRss } from "@/hooks/queries/useRecentRss";

const STORY_WINDOW_MS = 24 * 60 * 60 * 1000;

const isRecentlyPublished = (lastPublishedAt: string) =>
  Date.now() - new Date(lastPublishedAt).getTime() < STORY_WINDOW_MS;

function RssStoryItem({ rss }: { rss: RecentRss }) {
  const location = useLocation();
  const incrementView = useIncrementViewByPostId(rss.latestFeedId);
  const isStory = isRecentlyPublished(rss.lastPublishedAt);

  return (
    <li className="flex-shrink-0 w-20">
      <Link
        to={isStory ? `/${rss.latestFeedId}` : `/rss/${rss.id}`}
        state={isStory ? { backgroundLocation: location } : undefined}
        onClick={isStory ? () => incrementView() : undefined}
        className="flex flex-col items-center gap-1 group"
      >
        <div
          className={`rounded-full p-[2.5px] ${
            isStory ? "bg-gradient-to-tr from-lime-400 via-green-500 to-emerald-600" : ""
          }`}
          data-story={isStory || undefined}
        >
          <div className={`rounded-full p-[2px] ${isStory ? "bg-white" : ""}`}>
            <div className="overflow-hidden bg-white border rounded-full w-14 h-14">
              <PlatformIcon platform={rss.blogPlatform} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
        <span className="w-full mt-1 text-xs font-medium text-center truncate group-hover:underline">
          {rss.name}
        </span>
        <span
          className="px-2 py-0.5 text-[10px] text-white rounded-full max-w-full truncate"
          style={{
            backgroundColor: PLATFORM_BADGE_COLORS[rss.blogPlatform.toLowerCase()] ?? DEFAULT_BADGE_COLOR,
          }}
        >
          {rss.blogPlatform}
        </span>
      </Link>
    </li>
  );
}

export default function RecentRssSection() {
  const { data: rssList = [], isLoading } = useRecentRss();

  if (!isLoading && rssList.length === 0) return null;

  return (
    <section className="flex flex-col md:p-4">
      <SectionHeader
        icon={Rss}
        text="RSS"
        description="최근 게시글을 발행한 블로그"
        iconColor="text-orange-500"
      />

      <div className="p-4 md:mt-4 md:p-0">
        {isLoading ? (
          <ul className="flex gap-6 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i} className="flex flex-col items-center flex-shrink-0 w-20 gap-2">
                <div className="rounded-full w-14 h-14 bg-gray-200 animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded-full animate-pulse" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className={`flex overflow-x-auto ${rssList.length >= 10 ? "justify-between gap-2" : "gap-6"}`}>
            {rssList.map((rss) => (
              <RssStoryItem key={rss.id} rss={rss} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
