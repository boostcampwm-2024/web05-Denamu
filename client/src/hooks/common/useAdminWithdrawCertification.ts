import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import axios from "axios";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { auth } from "@/api/services/admin/auth";

export const useAdminWithdrawCertification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useCustomToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const withdrawAdmin = async () => {
      if (!token) {
        toast({
          title: "탈퇴 실패",
          description: "유효하지 않은 인증 링크입니다.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        await auth.confirmWithdraw(token);
        setIsSuccess(true);
        toast({
          title: "탈퇴 완료",
          description: "관리자 계정이 삭제되었습니다.",
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "탈퇴 실패",
            description: error.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "탈퇴 실패",
            description: "탈퇴 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    withdrawAdmin();
  }, [token, toast]);

  return { isLoading, isSuccess };
};
