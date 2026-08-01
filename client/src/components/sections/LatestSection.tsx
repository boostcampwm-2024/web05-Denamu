import { useNavigate } from "react-router-dom";

import { LogIn, Rss, SquareX } from "lucide-react";

import { SectionHeader } from "@/components/common/SectionHeader";
import Filter from "@/components/filter/Filter";
import LatestFeedList from "@/components/sections/LatestFeedList";
import LatestSectionTimer from "@/components/sections/LatestSectionTimer";
import SubscriptionFeedList from "@/components/sections/SubscriptionFeedList";

import { useRecentTag } from "@/hooks/common/useRecentTag";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useFilterStore } from "@/store/useFilterStore";
import { usePostTypeStore } from "@/store/usePostTypeStore";

export default function LatestSection() {
  const navigate = useNavigate();
  const pickedFilter = useFilterStore((state) => state.filters);
  const removeFilter = useFilterStore((state) => state.removeAll);
  const postType = usePostTypeStore((state) => state.postType);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const recentTags = useRecentTag();
  const tags = postType === "latest" ? pickedFilter : recentTags;

  return (
    <section className="flex flex-col md:p-4 min-h-[300px]">
      <div className="flex items-center gap-3">
        <SectionHeader
          icon={Rss}
          text="최신 포스트"
          description="최근에 작성된 포스트"
          iconColor="text-orange-500"
          secondText="추천 포스트"
          secondDescription="사용자 맞춤 추천 포스트"
          thirdText="구독 포스트"
          thirdDescription="구독한 블로그의 포스트"
        />
        {pickedFilter.length !== 0 && postType === "latest" && (
          <div className=" gap-2 items-center hidden md:flex">
            <ul className="flex flex-wrap gap-x-2 gap-y-2">
              {pickedFilter.map((filter, index) => (
                <Badge key={index} className="hover:bg-primary">
                  {filter}
                </Badge>
              ))}
            </ul>
            <button onClick={removeFilter}>
              <SquareX size={13} color="red" />
            </button>

            <span className="text-gray-400 text-xs">카테고리 지정은 최대 5개까지 가능합니다.</span>
          </div>
        )}
        <div className="ml-auto">
          <LatestSectionTimer />
        </div>
      </div>
      {postType === "latest" && <Filter />}
      <div className="flex-1 mt-4 md:p-6 md:pt-0 rounded-lg">
        {postType === "subscribe" ? (
          isAuthenticated ? (
            <SubscriptionFeedList />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FF870D]/10">
                <Rss className="w-6 h-6 text-[#FF870D]" />
              </div>
              <div>
                <p className="font-semibold">로그인이 필요한 기능입니다</p>
                <p className="mt-1 text-sm text-gray-400">로그인하고 구독한 블로그의 포스트를 모아보세요.</p>
              </div>
              <Button onClick={() => navigate("/signin")} className="gap-1.5 bg-[#FF870D] hover:bg-[#e6790b]">
                <LogIn className="w-4 h-4" />
                로그인 하러가기
              </Button>
            </div>
          )
        ) : (
          <LatestFeedList tags={tags} />
        )}
      </div>
    </section>
  );
}
