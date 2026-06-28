import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";

import { FormInput } from "@/components/RssRegistration/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useAdminResetPassword } from "@/hooks/queries/useAdminAuth";

const PASSWORD_REG = /^(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{6,60}$/;

export default function AdminPasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useCustomToast();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { mutate, isPending } = useAdminResetPassword(
    () => {
      setIsSuccess(true);
      toast({
        title: "비밀번호 변경 완료",
        description: "새 비밀번호로 다시 로그인해주세요.",
      });
    },
    (error) => {
      toast({
        title: "비밀번호 변경 실패",
        description:
          (axios.isAxiosError(error) && (error.response?.data as { message?: string })?.message) ||
          "인증 링크가 만료되었거나 유효하지 않습니다.",
        variant: "destructive",
      });
    }
  );

  const handleSubmit = () => {
    if (!token) {
      toast({
        title: "비밀번호 변경 실패",
        description: "유효하지 않은 인증 링크입니다.",
        variant: "destructive",
      });
      return;
    }
    if (!PASSWORD_REG.test(password)) {
      toast({
        title: "비밀번호 형식 오류",
        description: "비밀번호는 6~60자이며 특수문자를 1개 이상 포함해야 합니다.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "두 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    mutate({ token, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>{isSuccess ? "비밀번호 변경 완료" : "관리자 비밀번호 재설정"}</CardTitle>
          <CardDescription>
            {isSuccess ? "새 비밀번호로 다시 로그인해주세요." : "새로 사용할 비밀번호를 입력해주세요."}
          </CardDescription>
        </CardHeader>
        {isSuccess ? (
          <>
            <CardContent>
              <div className="text-center text-green-600">
                <p>비밀번호가 성공적으로 변경되었습니다.</p>
                <p>기존 로그인 세션은 모두 만료되었습니다.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate("/admin")}>관리자 페이지로 가기</Button>
            </CardFooter>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <CardContent>
              <div className="grid gap-4 py-4">
                <FormInput
                  id="password"
                  label="새 비밀번호"
                  onChange={setPassword}
                  placeholder="새 비밀번호를 입력해주세요."
                  value={password}
                  type="password"
                />
                <FormInput
                  id="confirm-password"
                  label="비밀번호 확인"
                  onChange={setConfirmPassword}
                  placeholder="비밀번호를 다시 입력해주세요."
                  value={confirmPassword}
                  type="password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
