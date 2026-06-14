import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { useCustomToast } from "@/hooks/common/useCustomToast";

export const AuthResetPasswordForm = () => {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const { form, updateField, isLoading, result, token, submitForm } = useResetPassword();

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast({ title: "비밀번호 변경 완료", description: result.message });
      navigate("/signin");
    } else {
      const isAuthFailure = result.status === 404;
      toast({
        title: isAuthFailure ? "인증 실패" : "오류",
        description: result.message,
        variant: "destructive",
      });
      if (isAuthFailure) navigate("/signin");
    }
  }, [result, toast, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  if (!token) {
    return (
      <AuthCard title="유효하지 않은 링크" description="비밀번호 재설정">
        <p className="text-center text-sm text-muted-foreground">
          유효하지 않은 접근입니다. 이메일에서 링크를 통해 접근해주세요.
        </p>
        <div className="mt-4">
          <Button className="w-full" onClick={() => navigate("/users/forgot-password")}>
            비밀번호 찾기로 이동
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="비밀번호 재설정" description="새 비밀번호를 입력해주세요">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="새 비밀번호를 입력하세요"
            required
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            required
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">8~32자, 대문자/소문자/숫자/특수문자 중 2가지 이상 포함</p>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "처리 중..." : "비밀번호 변경"}
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
