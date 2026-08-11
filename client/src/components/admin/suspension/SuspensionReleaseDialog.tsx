import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SuspensionReleaseDialogProps {
  open: boolean;
  title: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (invalidate: boolean) => void;
}

export function SuspensionReleaseDialog({
  open,
  title,
  isPending,
  onOpenChange,
  onConfirm,
}: SuspensionReleaseDialogProps) {
  const [invalidate, setInvalidate] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setInvalidate(false);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[1000]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="suspension-invalidate">무효처리 (정지 내역 완전 삭제)</Label>
          <Switch id="suspension-invalidate" checked={invalidate} onCheckedChange={setInvalidate} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={() => onConfirm(invalidate)} disabled={isPending}>
            {isPending ? "처리 중..." : "해제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
