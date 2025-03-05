import { GitHub } from "@/components/icons/social/GitHub.tsx";
import { Google } from "@/components/icons/social/Google.tsx";
import { Kakao } from "@/components/icons/social/Kakao.tsx";
import { Naver } from "@/components/icons/social/Naver.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { TOAST_MESSAGES } from "@/constants/messages.ts";

export const AuthSocialLoginButtons = () => {
  const { toast } = useCustomToast();
  const handleSocialLogin = () => {
    toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED);
  };

  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button variant="outline" className="w-full" onClick={handleSocialLogin}>
          <GitHub />
          <span className="text-muted-foreground">Github로 계속하기</span>
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSocialLogin}>
          <Google />
          <span className="text-muted-foreground">Google로 계속하기</span>
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSocialLogin}>
          <Naver className="text-[#03C75A]" />
          <span className="text-muted-foreground">네이버로 계속하기</span>
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSocialLogin}>
          <Kakao className="text-[#FEE500]" />
          <span className="text-muted-foreground">카카오로 계속하기</span>
        </Button>
      </div>
    </>
  );
};
