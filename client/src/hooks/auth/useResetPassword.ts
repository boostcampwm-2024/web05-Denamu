import { useState } from "react";

import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import { changePassword } from "@/api/services/user";
import { useCustomToast } from "@/hooks/common/useCustomToast";
import { ResetPasswordResult } from "@/types/auth";

const PASSWORD_REGEX =
  /^(?=.{8,32}$)(?:(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[^A-Za-z0-9])|(?=.*[A-Z])(?=.*\d)|(?=.*[A-Z])(?=.*[^A-Za-z0-9])|(?=.*\d)(?=.*[^A-Za-z0-9])).*$/;

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const token = searchParams.get("token");

  const [form, setForm] = useState<ResetPasswordForm>({ password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResetPasswordResult | null>(null);

  const updateField = (field: keyof ResetPasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async () => {
    if (!token) {
      setResult({ success: false, message: "유효하지 않은 링크입니다." });
      return;
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      setResult({
        success: false,
        message: "비밀번호는 8~32자이며 대문자, 소문자, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.",
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setResult({ success: false, message: "비밀번호가 일치하지 않습니다." });
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(token, form.password);
      toast({ title: "비밀번호 변경 완료", description: "비밀번호가 성공적으로 변경되었습니다." });
      navigate("/signin");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          toast({ title: "인증 실패", description: "인증에 실패했습니다.", variant: "destructive" });
          navigate("/signin");
        } else {
          setResult({
            success: false,
            message: error.response?.data?.message ?? "비밀번호 변경 중 오류가 발생했습니다.",
            status,
          });
        }
      } else {
        setResult({ success: false, message: "비밀번호 변경 중 오류가 발생했습니다." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { form, updateField, isLoading, result, token, submitForm };
}