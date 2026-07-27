import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import { AuthCard } from "@/components/auth/AuthCard.tsx";
import { MarketingConsentNotice } from "@/components/common/MarketingConsentNotice.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { completeOAuthRegistration } from "@/api/services/user";
import { useAuthStore } from "@/store/useAuthStore.ts";

export default function OAuthSignUpPage() {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const initialize = useAuthStore((s) => s.initialize);

  const [userName, setUserName] = useState("");
  const [marketingEmailAgreed, setMarketingEmailAgreed] = useState(false);
  const [inactivityEmailAgreed, setInactivityEmailAgreed] = useState(false);
  const [noticeEmailAgreed, setNoticeEmailAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      toast({ title: "닉네임을 입력해주세요.", variant: "destructive" });
      inputRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      await completeOAuthRegistration({
        userName,
        marketingEmailAgreed,
        inactivityEmailAgreed,
        noticeEmailAgreed,
      });
      initialize();
      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast({
          title: "닉네임 중복",
          description: "이미 존재하는 닉네임입니다. 다른 닉네임을 입력해주세요.",
          variant: "destructive",
        });
        inputRef.current?.focus();
        return;
      }

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "회원가입 중 오류가 발생했습니다.";
      toast({
        title: "회원가입 실패",
        description: message ?? "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="닉네임 설정" description="서비스에서 사용할 닉네임을 입력해주세요.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="닉네임을 입력하세요"
          required
          autoFocus
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="marketingEmailAgreed" className="text-sm font-normal text-muted-foreground">
              마케팅 활용 및 광고성 정보 수신 동의
            </Label>
            <Switch
              id="marketingEmailAgreed"
              checked={marketingEmailAgreed}
              onCheckedChange={setMarketingEmailAgreed}
            />
          </div>
          <MarketingConsentNotice />
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="inactivityEmailAgreed" className="text-sm font-normal text-muted-foreground">
              미접속 알림 이메일 수신 동의
            </Label>
            <Switch
              id="inactivityEmailAgreed"
              checked={inactivityEmailAgreed}
              onCheckedChange={setInactivityEmailAgreed}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="noticeEmailAgreed" className="text-sm font-normal text-muted-foreground">
              공지사항 이메일 수신 동의
            </Label>
            <Switch id="noticeEmailAgreed" checked={noticeEmailAgreed} onCheckedChange={setNoticeEmailAgreed} />
          </div>
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "처리 중..." : "시작하기"}
        </Button>
      </form>
    </AuthCard>
  );
}
