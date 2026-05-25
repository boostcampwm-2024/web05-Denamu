import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { useCustomToast } from "@/hooks/common/useCustomToast";

export const AuthForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const { form, updateField, isLoading, result, submitForm } = useForgotPassword();

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast({ title: "이메일 발송 완료", description: "재설정 메일을 발송했습니다. 받은 편지함을 확인해주세요." });
      navigate("/signin");
    } else {
      toast({ title: "요청 실패", description: result.message, variant: "destructive" });
    }
  }, [result, toast, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <AuthCard title="비밀번호 찾기" description="가입한 이메일을 입력해주세요">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="이메일을 입력하세요"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "전송 중..." : "재설정 메일 발송"}
        </Button>
      </form>
      <div className="mt-4">
        <Button
          variant="link"
          className="h-auto p-0 text-muted-foreground underline underline-offset-4"
          onClick={() => navigate("/signin")}
        >
          로그인으로 돌아가기
        </Button>
      </div>
    </AuthCard>
  );
};