import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { REPORT_REASON_LABELS } from "@/constants/report";

import { CreateReportPayload, ReportReason } from "@/types/report";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isPending?: boolean;
  withBlockOption?: boolean;
  blockLabel?: string;
  blockDescription?: string;
  onSubmit: (payload: CreateReportPayload, blockToo: boolean) => void;
}

const REPORT_REASON_OPTIONS = Object.entries(REPORT_REASON_LABELS) as [ReportReason, string][];

export function ReportDialog({
  open,
  onOpenChange,
  title,
  isPending = false,
  withBlockOption = false,
  blockLabel = "이 유저도 함께 차단하기",
  blockDescription = "차단하면 댓글, 프로필 페이지 열람이 제한됩니다.",
  onSubmit,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [detail, setDetail] = useState("");
  const [blockToo, setBlockToo] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason("");
      setDetail("");
      setBlockToo(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = () => {
    if (!reason || isPending) return;
    onSubmit({ reason, detail: detail.trim() || undefined }, blockToo);
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="z-[1000]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>신고 사유를 선택해주세요. 접수된 신고는 관리자가 검토합니다.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-reason">신고 사유</Label>
              <Select value={reason || undefined} onValueChange={(value) => setReason(value as ReportReason)}>
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

            {withBlockOption && (
              <div className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="report-block-too">{blockLabel}</Label>
                  <span className="text-xs text-muted-foreground">{blockDescription}</span>
                </div>
                <Switch id="report-block-too" checked={blockToo} onCheckedChange={setBlockToo} />
              </div>
            )}
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
    </div>
  );
}
