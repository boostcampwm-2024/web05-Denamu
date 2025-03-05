import { useLocation, useNavigate } from "react-router-dom";

import { AuthCard } from "@/components/auth/AuthCard.tsx";
import { AuthSocialLoginButtons } from "@/components/auth/AuthSocialLoginButtons.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { TOAST_MESSAGES } from "@/constants/messages.ts";

export const AuthSignInForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();

  return (
    <>
      <AuthCard title="로그인" description="로그인을 해주세요">
        <form className="space-y-4">
          <div className="space-y-2">
            <Input type="email" placeholder="이메일을 입력하세요" required />
            <Input type="password" placeholder="비밀번호를 입력하세요" required />
          </div>
          <Button
            className="w-full"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED);
            }}
          >
            로그인
          </Button>
        </form>
        <AuthSocialLoginButtons />
        <div className="mt-4">
          <Button
            variant="link"
            className="text-muted-foreground underline underline-offset-4 h-auto p-0"
            onClick={() => navigate("/signup", { state: { from: location.pathname } })}
          >
            계정이 없으신가요?
          </Button>
        </div>
      </AuthCard>
    </>
  );
};
