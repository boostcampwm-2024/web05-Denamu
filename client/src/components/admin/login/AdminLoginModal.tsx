import { useState } from "react";

import AdminForgotPasswordModal from "@/components/admin/login/AdminForgotPasswordModal";
import { FormInput } from "@/components/RssRegistration/FormInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useKeyboardShortcut } from "@/hooks/common/useKeyboardShortcut";
import { useAdminAuth } from "@/hooks/queries/useAdminAuth";

export default function AdminLogin({ setLogin }: { setLogin: () => void }) {
  const [loginData, setLoginData] = useState<{ email: string; password: string }>({ email: "", password: "" });
  const [loginError, setLoginError] = useState<boolean>(false);
  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const handleChange = (field: "email" | "password", value: string) => {
    setLoginData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };
  const onSuccess = () => {
    setLogin();
  };

  const onError = () => {
    setLoginError(true);
  };
  const { mutate } = useAdminAuth(onSuccess, onError);

  const handleAdminAuth = () => {
    mutate(loginData);
  };
  useKeyboardShortcut("Enter", handleAdminAuth, false);
  return (
    <div className="h-[100vh] flex justify-center items-center bg-black/80">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>관리자 로그인</CardTitle>
          <CardDescription>관리자 로그인 페이지입니다.</CardDescription>
        </CardHeader>
        <form
          onSubmit={(event) => {
            event?.preventDefault();
            handleAdminAuth();
          }}
        >
          <CardContent>
            <div className="grid gap-4 py-4">
              <FormInput
                id="email"
                label="이메일"
                onChange={(value) => handleChange("email", value)}
                placeholder="이메일을 입력해주세요."
                value={loginData.email}
                type="email"
              />
              <FormInput
                id="password"
                label="Password"
                onChange={(value) => handleChange("password", value)}
                placeholder="비밀번호를 입력해주세요."
                value={loginData.password}
                type="password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              로그인
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AdminForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />

      <AlertDialog open={loginError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인 실패</AlertDialogTitle>
            <AlertDialogDescription>이메일 또는 비밀번호를 확인하세요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setLoginError(false);
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
