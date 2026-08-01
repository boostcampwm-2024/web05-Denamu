import { AuthBanner } from "@/components/auth/AuthBanner";
import { AuthForgotPasswordForm } from "@/components/auth/AuthForgotPasswordForm";
import SplitLayout from "@/components/layout/SplitLayout";

export default function ForgotPassword() {
  return (
    <SplitLayout>
      <div className="hidden w-1/2 bg-sidebar lg:block">
        <AuthBanner />
      </div>
      <div className="w-full lg:w-1/2">
        <AuthForgotPasswordForm />
      </div>
    </SplitLayout>
  );
}