import { useState } from "react";
import { Helmet } from "react-helmet";

import { CalendarClock, FileText } from "lucide-react";

import { Footer } from "@/components/about/Footer";
import Layout from "@/components/layout/Layout";
import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useNavigateToRss } from "@/hooks/common/useNavigateToRss";
import { useAllRss } from "@/hooks/queries/useAllRss";

import { formatDate } from "@/utils/date";

import { RSS_LIST_PLATFORM_FILTERS } from "@/constants/rss";

const PAGE_SIZE = 21;
const ALL_PLATFORMS = "all";
const ALL_PLATFORMS_LABEL = "전체 플랫폼";

export default function RssListPage() {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState(ALL_PLATFORMS);
  const navigateToRss = useNavigateToRss();
  const { data, isLoading, isError } = useAllRss(page, PAGE_SIZE, platform === ALL_PLATFORMS ? undefined : platform);

  const rssList = data?.data.result ?? [];
  const totalCount = data?.data.totalCount ?? 0;
  const totalPages = data?.data.totalPages ?? 0;

  const handlePlatformChange = (value: string) => {
    setPlatform(value);
    setPage(1);
  };

  const selectedPlatform = RSS_LIST_PLATFORM_FILTERS.find((p) => p.value === platform);

  return (
    <>
      <Layout>
        <Helmet>
          <title>등록된 RSS - 데나무</title>
        </Helmet>

        <div className="max-w-5xl px-4 py-8 mx-auto md:px-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="mb-1 text-2xl font-bold">등록된 RSS</h1>
              <p className="text-sm text-gray-500">
                {selectedPlatform ? `${selectedPlatform.label} 블로그` : "등록된 블로그"} 총 {totalCount}개
              </p>
            </div>

            <Select value={platform} onValueChange={handlePlatformChange}>
              <SelectTrigger className="w-36 shrink-0" aria-label="플랫폼 필터">
                <SelectValue placeholder={ALL_PLATFORMS_LABEL}>
                  {selectedPlatform ? (
                    <span className="flex items-center gap-2">
                      <PlatformIcon platform={selectedPlatform.value} className="w-4 h-4" />
                      {selectedPlatform.label}
                    </span>
                  ) : (
                    ALL_PLATFORMS_LABEL
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PLATFORMS}>{ALL_PLATFORMS_LABEL}</SelectItem>
                {RSS_LIST_PLATFORM_FILTERS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <PlatformIcon platform={value} className="w-4 h-4" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && <p className="py-12 text-sm text-center text-gray-400">불러오는 중...</p>}
          {isError && <p className="py-12 text-sm text-center text-red-500">RSS 목록을 불러오지 못했습니다.</p>}
          {!isLoading && !isError && rssList.length === 0 && (
            <p className="py-12 text-sm text-center text-gray-400">등록된 RSS가 없습니다.</p>
          )}

          {!isLoading && !isError && rssList.length > 0 && (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rssList.map((rss) => (
                <li key={rss.id}>
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => navigateToRss(rss.id)}
                    onKeyDown={(e) => e.key === "Enter" && navigateToRss(rss.id)}
                    className="transition-colors cursor-pointer hover:bg-accent"
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="overflow-hidden bg-white border rounded-full w-10 h-10 shrink-0">
                        <PlatformIcon
                          platform={rss.blogPlatform}
                          image={rss.blogImage}
                          name={rss.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                        <span className="font-medium truncate">{rss.name}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          게시글 {rss.feedCount}개
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarClock className="w-3 h-3" />
                          최근 게시글 {rss.lastPublishedAt ? formatDate(rss.lastPublishedAt) : "-"}
                        </span>
                      </div>
                      <BlogPlatformBadge platform={rss.blogPlatform} className="shrink-0" />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
      <Footer />
    </>
  );
}
