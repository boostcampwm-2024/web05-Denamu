import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { SUSPENSION_PRESET_LABELS } from "@/constants/report";

import { SuspensionPreset } from "@/types/report";
import { computeSuspendedUntil, presetToDatetimeLocal } from "@/utils/suspension";

const SUSPENSION_PRESET_OPTIONS = Object.entries(SUSPENSION_PRESET_LABELS) as [SuspensionPreset, string][];

interface SuspensionPayload {
  suspendedUntil?: string;
  detail: string;
}

interface SuspensionFormDialogProps {
  open: boolean;
  title: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: SuspensionPayload) => void;
}

export function SuspensionFormDialog({ open, title, isPending, onOpenChange, onSubmit }: SuspensionFormDialogProps) {
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[1000]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
