import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import axios from "axios";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { register } from "@/api/services/admin/register";

export const useAdminCertification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useCustomToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!token) {
        toast({
          title: "인증 실패",
          description: "유효하지 않은 인증 링크입니다.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        await register.certificate(token);
        setIsSuccess(true);
        toast({
          title: "인증 성공",
          description: "관리자 계정이 생성되었습니다. 로그인 후 이용해주세요.",
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "인증 실패",
            description: error.response?.data?.message || "인증 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "인증 실패",
            description: "인증 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [token, toast]);

  return { isLoading, isSuccess };
};
