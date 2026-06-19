import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import axios from "axios";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { removeRss } from "@/api/services/rss";

export const useRssRemoval = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { toast } = useCustomToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const confirmRemoval = async () => {
    if (!code) {
      return;
    }

    setIsDeleting(true);
    setIsError(false);

    try {
      await removeRss(code);
      setIsSuccess(true);
      toast({
        title: "삭제 완료",
        description: "RSS 삭제가 완료되었습니다.",
      });
    } catch (error: unknown) {
      setIsError(true);
      if (axios.isAxiosError(error)) {
        toast({
          title: "삭제 실패",
          description: error.response?.data?.message || "삭제 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "삭제 실패",
          description: "삭제 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return { hasCode: Boolean(code), isDeleting, isSuccess, isError, confirmRemoval };
};
