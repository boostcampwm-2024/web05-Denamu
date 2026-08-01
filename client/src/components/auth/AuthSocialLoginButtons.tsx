import { GitHub } from "@/components/icons/social/GitHub.tsx";
import { Google } from "@/components/icons/social/Google.tsx";
import { Button } from "@/components/ui/button.tsx";

import { BASE_URL, OAUTH } from "@/constants/endpoints.ts";
import { nav } from "@/utils/redirect.ts";

export const AuthSocialLoginButtons = () => {
  const handleSocialLogin = (provider: "google" | "github") => {
    nav.redirect(`${BASE_URL}${OAUTH.LOGIN}?type=${provider}`);
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
        <Button
          variant="outline"
          className="w-full"
          data-testid="oauth-github-button"
          onClick={() => handleSocialLogin("github")}
        >
          <GitHub />
          <span className="text-muted-foreground">Github로 계속하기</span>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          data-testid="oauth-google-button"
          onClick={() => handleSocialLogin("google")}
        >
          <Google />
          <span className="text-muted-foreground">Google로 계속하기</span>
        </Button>
      </div>
    </>
  );
};
