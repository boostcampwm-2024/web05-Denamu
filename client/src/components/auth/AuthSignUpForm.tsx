import { useLocation, useNavigate } from "react-router-dom";

import { AuthCard } from "@/components/auth/AuthCard.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { TOAST_MESSAGES } from "@/constants/messages.ts";

export const AuthSignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();

  return (
    <>
      <AuthCard title="회원가입" description="회원가입을 해주세요">
        <form className="space-y-4">
          <div className="space-y-2">
            <Input type="email" placeholder="이메일을 입력하세요" required />
            <Input type="password" placeholder="비밀번호를 입력하세요" required />
            <Input type="text" placeholder="이름을 입력해주세요" required />
            <Input type="text" placeholder="닉네임을 입력해주세요" required />
          </div>
          <Button
            className="w-full"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED);
            }}
          >
            회원가입
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
