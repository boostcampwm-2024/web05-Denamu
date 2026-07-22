import { useState } from "react";

import axios from "axios";

import { requestPasswordReset } from "@/api/services/user";
import { ForgotPasswordResult } from "@/types/auth";

interface ForgotPasswordForm {
  email: string;
}

export function useForgotPassword() {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);

  const updateField = (field: keyof ForgotPasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async () => {
    if (!form.email) {
      setResult({ success: false, message: "이메일을 입력해주세요." });
      return;
    }

    try {
      setIsLoading(true);
      const response = await requestPasswordReset(form.email);
      setResult({ success: true, message: response.message });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setResult({
          success: false,
          message: error.response?.data?.message ?? "요청 처리 중 오류가 발생했습니다.",
        });
      } else {
        setResult({ success: false, message: "요청 처리 중 오류가 발생했습니다." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { form, updateField, isLoading, result, submitForm };
}