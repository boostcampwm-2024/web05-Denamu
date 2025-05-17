import { useState } from "react";

import axios from "axios";

import { register } from "@/api/services/user";
import { SignUpForm, SignUpResult } from "@/types/auth";

export function useSignUp() {
  const [form, setForm] = useState<SignUpForm>({
    email: "",
    password: "",
    userName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SignUpResult | null>(null);

  const updateField = (field: keyof SignUpForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { email, password, userName } = form;
    return !!email && !!password && !!userName;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      setResult({
        success: false,
        message: "모든 필드를 입력해주세요.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await register(form);
      setResult({
        success: true,
        message: response.message,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        setResult({
          success: false,
          message: status === 409 ? "이미 존재하는 이메일입니다." : error.response?.data?.message,
          status,
        });
      } else {
        setResult({
          success: false,
          message: "회원가입 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    updateField,
    isLoading,
    result,
    submitForm,
  };
}
