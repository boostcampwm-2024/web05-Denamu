import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useApproveReport, useRejectReport } from "@/hooks/queries/useReport";

import { REPORT_REASON_LABELS, SUSPENSION_PRESET_DAYS, SUSPENSION_PRESET_LABELS } from "@/constants/report";

import { getReports } from "@/api/services/report";
import { ApproveReportPayload, ReportItem, SuspensionPreset } from "@/types/report";
import { useInfiniteQuery } from "@tanstack/react-query";

const TARGET_TYPE_LABELS: Record<ReportItem["targetType"], string> = {
  USER: "사용자",
  RSS: "RSS",
  COMMENT: "댓글",
  FEED: "게시글",
};

const TARGET_TYPE_BADGE_CLASSES: Record<ReportItem["targetType"], string> = {
  USER: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RSS: "border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMMENT:
    "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  FEED: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const SUSPENSION_PRESET_OPTIONS = Object.entries(SUSPENSION_PRESET_LABELS) as [SuspensionPreset, string][];

const PAGE_SIZE = 10;

const fromDatetimeLocal = (value: string): string | undefined => {
  if (!value) return undefined;
  return new Date(value).toISOString();
};

const toDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const presetToDatetimeLocal = (preset: SuspensionPreset): string => {
  const days = SUSPENSION_PRESET_DAYS[preset];
  if (!days) return "";
  return toDatetimeLocal(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
};

const computeSuspendedUntil = (preset: SuspensionPreset | null, dateValue: string): string | undefined => {
  if (preset === "PERMANENT") return undefined;
  return fromDatetimeLocal(dateValue);
};

export default function AdminReportTab() {
  const [approveTarget, setApproveTarget] = useState<ReportItem | null>(null);
  const { toast } = useCustomToast();

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["adminReports"],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getReports({
        lastId: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    initialPageParam: undefined as number | undefined,
  });

  const { mutate: approveReport, isPending: isApproving } = useApproveReport();
  const { mutate: rejectReport } = useRejectReport();

  const reports = data?.pages.flatMap((page) => page.result) ?? [];

  const handleApprove = (payload: ApproveReportPayload) => {
    if (!approveTarget) return;
    approveReport(
      { reportId: approveTarget.id, payload },
      {
        onSuccess: () => {
          toast({ description: "신고를 승인하고 정지 처리를 완료했습니다." });
          setApproveTarget(null);
        },
        onError: () => toast({ description: "승인 처리 중 오류가 발생했습니다.", variant: "destructive" }),
      }
    );
  };

  const handleReject = (reportId: number) => {
    rejectReport(reportId, {
      onSuccess: () => toast({ description: "신고를 거절했습니다." }),
      onError: () => toast({ description: "거절 처리 중 오류가 발생했습니다.", variant: "destructive" }),
    });
  };

  return (
    <section className="flex flex-col gap-4 min-h-[300px]">
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
                  <Badge variant="outline" className={TARGET_TYPE_BADGE_CLASSES[report.targetType]}>
                    {TARGET_TYPE_LABELS[report.targetType]}
                  </Badge>
                  <span className="text-sm font-medium">{REPORT_REASON_LABELS[report.reason]}</span>
                  <span className="ml-auto text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</span>
                </div>

                <p className="text-sm text-gray-700">
                  대상: <span className="font-medium">{report.targetLabel ?? `(삭제된 대상 #${report.targetId})`}</span>
                </p>
                <p className="text-sm text-gray-500">신고자: {report.reporter?.userName ?? "(탈퇴한 사용자)"}</p>
                {report.detail && <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.detail}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        거절
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>신고 거절</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 신고를 거절하고 삭제하시겠습니까? 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleReject(report.id)}>거절하기</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button size="sm" onClick={() => setApproveTarget(report)}>
                    승인
                  </Button>
                </div>
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

      <ApproveSuspensionDialog
        key={approveTarget?.id ?? "none"}
        target={approveTarget}
        isPending={isApproving}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        onSubmit={handleApprove}
      />
    </section>
  );
}

interface ApproveSuspensionDialogProps {
  target: ReportItem | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ApproveReportPayload) => void;
}

function ApproveSuspensionDialog({ target, isPending, onOpenChange, onSubmit }: ApproveSuspensionDialogProps) {
  const [preset, setPreset] = useState<SuspensionPreset | null>("SEVEN_DAYS");
  const [dateValue, setDateValue] = useState(() => presetToDatetimeLocal("SEVEN_DAYS"));
  const [detail, setDetail] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPreset("SEVEN_DAYS");
      setDateValue(presetToDatetimeLocal("SEVEN_DAYS"));
      setDetail("");
    }
    onOpenChange(nextOpen);
  };

  const handlePresetChange = (value: SuspensionPreset) => {
    setPreset(value);
    setDateValue(value === "PERMANENT" ? "" : presetToDatetimeLocal(value));
  };

  const handleDateChange = (value: string) => {
    setDateValue(value);
    setPreset(null);
  };

  const isDateMissing = preset !== "PERMANENT" && !dateValue;
  const canSubmit = !!detail.trim() && !isDateMissing && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      suspendedUntil: computeSuspendedUntil(preset, dateValue),
      detail: detail.trim(),
    });
  };

  return (
    <Dialog open={!!target} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[1000]">
        <DialogHeader>
          <DialogTitle>신고 승인 및 정지 처리</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>정지 기간</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {SUSPENSION_PRESET_OPTIONS.map(([value, label]) => (
                <label key={value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="suspension-preset"
                    value={value}
                    checked={preset === value}
                    onChange={() => handlePresetChange(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="suspension-custom-until">정지 종료 일시</Label>
            <Input
              id="suspension-custom-until"
              type="datetime-local"
              value={dateValue}
              onChange={(event) => handleDateChange(event.target.value)}
              onClick={(event) => event.currentTarget.showPicker?.()}
              className="relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="suspension-detail">처리 상세 내역</Label>
            <Textarea
              id="suspension-detail"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="정지 사유 및 처리 내용을 입력해주세요."
              maxLength={500}
              className="resize-none"
            />
            <span className="self-end text-xs text-muted-foreground">{detail.length}/500</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isPending ? "처리 중..." : "정지 처리"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
