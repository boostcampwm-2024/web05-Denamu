import { AuthBanner } from "@/components/auth/AuthBanner";
import { AuthResetPasswordForm } from "@/components/auth/AuthResetPasswordForm";
import SplitLayout from "@/components/layout/SplitLayout";

export default function ResetPassword() {
  return (
    <SplitLayout>
      <div className="hidden w-1/2 bg-sidebar lg:block">
        <AuthBanner />
      </div>
      <div className="w-full lg:w-1/2">
        <AuthResetPasswordForm />
      </div>
    </SplitLayout>
  );
}