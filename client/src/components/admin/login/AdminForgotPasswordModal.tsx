import { useState } from "react";

import axios from "axios";

import { FormInput } from "@/components/RssRegistration/FormInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useAdminForgotPassword } from "@/hooks/queries/useAdminAuth";

interface AdminForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminForgotPasswordModal({ open, onOpenChange }: AdminForgotPasswordModalProps) {
  const [email, setEmail] = useState<string>("");
  const { toast } = useCustomToast();

  const { mutate, isPending } = useAdminForgotPassword(
    () => {
      toast({
        title: "이메일 발송 완료",
        description: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
      });
      setEmail("");
      onOpenChange(false);
    },
    (error) => {
      toast({
        title: "요청 실패",
        description:
          (axios.isAxiosError(error) && (error.response?.data as { message?: string })?.message) ||
          "비밀번호 재설정 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  );

  const handleSubmit = () => {
    if (!email) {
      return;
    }
    mutate({ email });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>비밀번호 찾기</DialogTitle>
          <DialogDescription>가입하신 관리자 이메일로 비밀번호 재설정 링크를 보내드립니다.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="py-4">
            <FormInput
              id="forgot-email"
              label="이메일"
              onChange={setEmail}
              placeholder="이메일을 입력해주세요."
              value={email}
              type="email"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "발송 중..." : "재설정 링크 받기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
