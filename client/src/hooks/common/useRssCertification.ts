import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import axios from "axios";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { verifyRssCertification } from "@/api/services/rss";

export const useRssCertification = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        toast({
          title: "인증 실패",
          description: "유효하지 않은 인증 링크입니다.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        await verifyRssCertification(code);
        setIsSuccess(true);
        setIsLoading(false);
        toast({
          title: "인증 성공",
          description: "RSS 소유 인증이 완료되었습니다.",
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast({
            title: "로그인이 필요합니다",
            description: "로그인 후 RSS 소유 인증을 완료할 수 있습니다.",
          });
          navigate("/signin", { state: { from: location.pathname + location.search } });
          return;
        }

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
        setIsLoading(false);
      }
    };

    verify();
  }, [code, toast, navigate, location.pathname, location.search]);

  return { isLoading, isSuccess };
};
