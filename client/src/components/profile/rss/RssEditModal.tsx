import { useEffect, useState } from "react";

import { AxiosError } from "axios";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useUpdateRssCertification } from "@/hooks/queries/useRssCertification.ts";

import { CertifiedRss } from "@/types/profile.ts";

interface RssEditModalProps {
  target: CertifiedRss | null;
  userId: number;
  onClose: () => void;
}

const getErrorMessage = (error: AxiosError<{ message?: string }>, fallback: string) =>
  error.response?.data?.message ?? fallback;

export const RssEditModal = ({ target, userId, onClose }: RssEditModalProps) => {
  const { toast } = useCustomToast();
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");

  const updateMutation = useUpdateRssCertification(userId);

  useEffect(() => {
    if (target) {
      setName(target.name);
      setUserName(target.userName);
    }
  }, [target]);

  const handleSave = () => {
    if (!target || !name.trim() || !userName.trim()) return;
    updateMutation.mutate(
      { id: target.id, name: name.trim(), userName: userName.trim() },
      {
        onSuccess: () => {
          toast({ title: "수정 완료", description: "RSS 정보가 수정되었습니다." });
          onClose();
        },
        onError: (error) => {
          toast({ title: "수정 실패", description: getErrorMessage(error, "다시 시도해주세요.") });
        },
      }
    );
  };

  return (
    <Dialog open={!!target} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-foreground">RSS 정보 수정</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            블로그 이름과 신청자 이름을 수정할 수 있습니다. (RSS 주소는 변경할 수 없습니다.)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editName">블로그 이름</Label>
            <Input id="editName" value={name} autoComplete="off" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editUserName">신청자 이름</Label>
            <Input
              id="editUserName"
              value={userName}
              autoComplete="off"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !userName.trim() || updateMutation.isPending}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
