import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { ArrowLeft, Ban, Clock } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard.tsx";
import { AuthSocialLoginButtons } from "@/components/auth/AuthSocialLoginButtons.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSignIn } from "@/hooks/auth/useSignIn";
import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { SignInSuspension } from "@/types/auth";

interface AuthSignInFormProps {
  hideBackButton?: boolean;
  onSuccess?: () => void;
}

export const AuthSignInForm = ({ hideBackButton = false, onSuccess }: AuthSignInFormProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useCustomToast();
  const { form, updateField, isLoading, result, submitForm } = useSignIn();
  const [suspension, setSuspension] = useState<SignInSuspension | null>(null);

  const [rejoinNoticeDate] = useState<string | null>(() => {
    if (searchParams.get("error") !== "rejoin_restricted") return null;
    const availableAt = new Date(searchParams.get("availableAt") ?? "");
    return Number.isNaN(availableAt.getTime()) ? "잠시 후" : availableAt.toLocaleDateString("ko-KR");
  });

  useEffect(() => {
    if (!rejoinNoticeDate) return;

    const timer = setTimeout(() => {
      toast({
        title: "재가입 제한",
        description: `탈퇴 후 재가입 제한 기간입니다. ${rejoinNoticeDate} 이후 다시 시도해주세요.`,
        variant: "destructive",
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [rejoinNoticeDate, toast]);

  useEffect(() => {
    if (searchParams.get("error") !== "rejoin_restricted") return;

    searchParams.delete("error");
    searchParams.delete("availableAt");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (result) {
      if (result.success) {
        toast({
          title: "로그인 성공",
          description: result.message,
        });

        if (onSuccess) {
          onSuccess();
          return;
        }

        const from = location.state?.from || "/";
        navigate(from === "/signup" ? "/" : from);
      } else if (result.status === 403 && result.suspension) {
        setSuspension(result.suspension);
      } else {
        toast({
          title: "로그인 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  }, [result, toast, navigate, location.state, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <>
      {!hideBackButton && (
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
      )}
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
      <AlertDialog open={!!suspension} onOpenChange={(open) => !open && setSuspension(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정지된 계정입니다</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-600">정지 사유</p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-red-900">{suspension?.detail}</p>
                </div>
                <Badge
                  className={
                    suspension?.suspendedUntil
                      ? "gap-1.5 border-amber-200 bg-amber-100 py-1 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                      : "gap-1.5 border-transparent bg-red-600 py-1 text-sm font-semibold text-white hover:bg-red-600"
                  }
                >
                  {suspension?.suspendedUntil ? <Clock className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                  해제 예정일:{" "}
                  {suspension?.suspendedUntil ? new Date(suspension.suspendedUntil).toLocaleString() : "무기한"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  이의가 있으신 경우{" "}
                  <a
                    href="mailto:boostcamp9web05@gmail.com"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    boostcamp9web05@gmail.com
                  </a>
                  으로 문의해주세요.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuspension(null)}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
