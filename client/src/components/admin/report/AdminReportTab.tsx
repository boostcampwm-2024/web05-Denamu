import { useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getReports } from "@/api/services/report";
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS } from "@/constants/report";
import { ReportItem, ReportStatus } from "@/types/report";

type StatusFilter = ReportStatus | "ALL";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "미처리", value: "PENDING" },
  { label: "조치완료", value: "ACTIONED" },
  { label: "반려", value: "REJECTED" },
];

const TARGET_TYPE_LABELS: Record<ReportItem["targetType"], string> = {
  USER: "사용자",
  RSS: "RSS",
  COMMENT: "댓글",
  FEED: "게시글",
};

const STATUS_BADGE_VARIANT: Record<ReportStatus, "default" | "secondary" | "outline"> = {
  PENDING: "default",
  ACTIONED: "secondary",
  REJECTED: "outline",
};

const PAGE_SIZE = 10;

export default function AdminReportTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["adminReports", statusFilter],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getReports({
        lastId: pageParam,
        limit: PAGE_SIZE,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    initialPageParam: undefined as number | undefined,
  });

  const reports = data?.pages.flatMap((page) => page.result) ?? [];

  return (
    <section className="flex flex-col gap-4 min-h-[300px]">
      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
        <TabsList>
          {STATUS_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-red-500">신고 목록을 불러오지 못했습니다.</p>
      ) : reports.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">신고 내역이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{TARGET_TYPE_LABELS[report.targetType]}</Badge>
                  <Badge variant={STATUS_BADGE_VARIANT[report.status]}>{REPORT_STATUS_LABELS[report.status]}</Badge>
                  <span className="text-sm font-medium">{REPORT_REASON_LABELS[report.reason]}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700">
                  대상: <span className="font-medium">{report.targetLabel ?? `(삭제된 대상 #${report.targetId})`}</span>
                </p>
                <p className="text-sm text-gray-500">
                  신고자: {report.reporter.userName} (#{report.reporter.id})
                </p>
                {report.detail && <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.detail}</p>}
              </CardContent>
            </Card>
          ))}

          {hasNextPage && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
