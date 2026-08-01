import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthCard } from "@/components/auth/AuthCard.tsx";
import { MarketingConsentNotice } from "@/components/common/MarketingConsentNotice.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useSignUp } from "@/hooks/auth/useSignUp";
import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

export const AuthSignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();

  const { form, updateField, updateAgreement, isLoading, result, submitForm } = useSignUp();

  useEffect(() => {
    if (result) {
      if (result.success) {
        toast({
          title: "회원가입 성공",
          description: result.message + " 만약 메일이 보이지 않는다면, 스팸 메일함을 확인해주세요.",
        });
        navigate("/signin", { state: { from: location.pathname } });
      } else {
        toast({
          title: "회원가입 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  }, [result, toast, navigate, location.pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <>
      <AuthCard title="회원가입" description="회원가입을 해주세요">
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
            <Input
              type="text"
              placeholder="이름을 입력해주세요"
              required
              value={form.userName}
              onChange={(e) => updateField("userName", e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="marketingEmailAgreed" className="text-sm font-normal text-muted-foreground">
                마케팅 활용 및 광고성 정보 수신 동의
              </Label>
              <Switch
                id="marketingEmailAgreed"
                checked={form.marketingEmailAgreed}
                onCheckedChange={(checked) => updateAgreement("marketingEmailAgreed", checked)}
              />
            </div>
            <MarketingConsentNotice />
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="inactivityEmailAgreed" className="text-sm font-normal text-muted-foreground">
                미접속 알림 이메일 수신 동의
              </Label>
              <Switch
                id="inactivityEmailAgreed"
                checked={form.inactivityEmailAgreed}
                onCheckedChange={(checked) => updateAgreement("inactivityEmailAgreed", checked)}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="noticeEmailAgreed" className="text-sm font-normal text-muted-foreground">
                공지사항 이메일 수신 동의
              </Label>
              <Switch
                id="noticeEmailAgreed"
                checked={form.noticeEmailAgreed}
                onCheckedChange={(checked) => updateAgreement("noticeEmailAgreed", checked)}
              />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "처리 중..." : "회원가입"}
          </Button>
        </form>
        <div className="mt-4">
          <Button
            variant="link"
            className="text-muted-foreground underline underline-offset-4 h-auto p-0"
            onClick={() => navigate("/signin", { state: { from: location.pathname } })}
          >
            이미 계정이 있으신가요?
          </Button>
        </div>
      </AuthCard>
    </>
  );
};
