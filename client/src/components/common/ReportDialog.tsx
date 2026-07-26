import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { REPORT_REASON_LABELS } from "@/constants/report";
import { CreateReportPayload, ReportReason } from "@/types/report";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isPending?: boolean;
  onSubmit: (payload: CreateReportPayload) => void;
  /**
   * 이미 자체적으로 스크롤을 잠그는 커스텀 모달(예: 게시글 detail 모달) 안에서 쓸 때는
   * false로 넘겨서 Radix의 자체 scroll-lock과 중복되어 배경이 밀리는 현상을 막는다.
   */
  modal?: boolean;
}

const REPORT_REASON_OPTIONS = Object.entries(REPORT_REASON_LABELS) as [ReportReason, string][];

export function ReportDialog({
  open,
  onOpenChange,
  title,
  isPending = false,
  onSubmit,
  modal = true,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [detail, setDetail] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason("");
      setDetail("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = () => {
    if (!reason || isPending) return;
    onSubmit({ reason, detail: detail.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={modal}>
      <DialogContent className="z-[1000]" onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>신고 사유를 선택해주세요. 접수된 신고는 관리자가 검토합니다.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-reason">신고 사유</Label>
            <Select value={reason || undefined} onValueChange={(value) => setReason(value as ReportReason)} modal={modal}>
              <SelectTrigger id="report-reason">
                <SelectValue placeholder="사유를 선택해주세요" />
              </SelectTrigger>
              <SelectContent className="z-[1001]">
                {REPORT_REASON_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-detail">상세 내용 (선택)</Label>
            <Textarea
              id="report-detail"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="신고 사유에 대해 자세히 설명해주세요."
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
          <Button onClick={handleSubmit} disabled={!reason || isPending} className="bg-red-600 hover:bg-red-700">
            {isPending ? "신고 접수 중..." : "신고하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
