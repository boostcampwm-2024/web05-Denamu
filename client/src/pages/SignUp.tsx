import { AuthBanner } from "@/components/auth/AuthBanner";
import { AuthSignUpForm } from "@/components/auth/AuthSignUpForm";
import SplitLayout from "@/components/layout/SplitLayout";

export default function SignUp() {
  return (
    <SplitLayout>
      <div className="hidden w-1/2 bg-sidebar lg:block">
        <AuthBanner />
      </div>
      <div className="w-full lg:w-1/2">
        <AuthSignUpForm />
      </div>
    </SplitLayout>
  );
}
