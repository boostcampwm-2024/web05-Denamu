import { useState } from "react";

import axios from "axios";

import { login } from "@/api/services/user";
import { useAuthStore } from "@/store/useAuthStore";
import { SignInForm, SignInResult } from "@/types/auth";

export function useSignIn() {
  const [form, setForm] = useState<SignInForm>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SignInResult | null>(null);
  const setUserFromToken = useAuthStore((state) => state.setUserFromToken);

  const updateField = (field: keyof SignInForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { email, password } = form;
    if (!email || !password) {
      setResult({
        success: false,
        message: "이메일과 비밀번호를 모두 입력해주세요.",
      });
      return false;
    }
    return true;
  };

  const saveTokens = (accessToken: string) => {
    setUserFromToken(accessToken);
  };

  const submitForm = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const response = await login(form);
      setResult({
        success: true,
        message: response.message,
        accessToken: response.data?.accessToken,
      });
      if (response.data?.accessToken) {
        saveTokens(response.data.accessToken);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        setResult({
          success: false,
          message:
            status === 401
              ? "아이디 혹은 비밀번호가 잘못되었습니다."
              : error.response?.data?.message || "로그인 중 오류가 발생했습니다.",
          status,
        });
      } else {
        setResult({
          success: false,
          message: "로그인 중 오류가 발생했습니다.",
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
