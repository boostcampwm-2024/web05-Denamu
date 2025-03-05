import { useState } from "react";

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
  const [loginData, setLoginData] = useState<{ loginId: string; password: string }>({ loginId: "", password: "" });
  const [loginError, setLoginError] = useState<boolean>(false);
  const handleChange = (field: "loginId" | "password", value: string) => {
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
                id="id"
                label="ID"
                onChange={(value) => handleChange("loginId", value)}
                placeholder="아이디를 입력해주세요."
                value={loginData.loginId}
                type="text"
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
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
              로그인
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={loginError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인 실패</AlertDialogTitle>
            <AlertDialogDescription>아이디 또는 비밀번호를 확인하세요.</AlertDialogDescription>
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
