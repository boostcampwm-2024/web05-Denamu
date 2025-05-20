import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import axios from "axios";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { certificateUser } from "@/api/services/user";

export const useUserCertification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useCustomToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
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
        await certificateUser(token);
        setIsSuccess(true);
        toast({
          title: "인증 성공",
          description: "회원가입이 완료되었습니다. 로그인 후 서비스를 이용해주세요.",
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

    verifyUser();
  }, [token, toast]);

  return { isLoading, isSuccess };
};
