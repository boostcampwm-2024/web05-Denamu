import { AuthBanner } from "@/components/auth/AuthBanner";
import { AuthSignInForm } from "@/components/auth/AuthSignInForm";
import SplitLayout from "@/components/layout/SplitLayout";

export default function SignIn() {
  return (
    <SplitLayout>
      <div className="hidden w-1/2 bg-sidebar lg:block">
        <AuthBanner />
      </div>
      <div className="w-full lg:w-1/2">
        <AuthSignInForm />
      </div>
    </SplitLayout>
  );
}
