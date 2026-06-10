import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard.tsx";
import { AuthSocialLoginButtons } from "@/components/auth/AuthSocialLoginButtons.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSignIn } from "@/hooks/auth/useSignIn";
import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

export const AuthSignInForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();
  const { form, updateField, isLoading, result, submitForm } = useSignIn();

  useEffect(() => {
    if (result) {
      if (result.success) {
        toast({
          title: "로그인 성공",
          description: result.message,
        });

        const from = location.state?.from || "/";
        navigate(from === "/signup" ? "/" : from);
      } else {
        toast({
          title: "로그인 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  }, [result, toast, navigate, location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <>
      <div className="px-6 pt-6 pb-2">
        <button
          type="button"
          aria-label="Denamu 홈으로 돌아가기"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Denamu 홈으로 돌아가기
        </button>
      </div>
      <AuthCard title="로그인" description="로그인을 해주세요">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-muted-foreground underline underline-offset-4"
                onClick={() => navigate("/users/forgot-password")}
              >
                비밀번호를 잊으셨나요?
              </Button>
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
        <AuthSocialLoginButtons />
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <p className="text-sm text-muted-foreground/60">계정이 없으신가요?</p>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-medium text-foreground"
            onClick={() => navigate("/signup", { state: { from: location.pathname } })}
          >
            회원가입
          </Button>
        </div>
      </AuthCard>
    </>
  );
};
