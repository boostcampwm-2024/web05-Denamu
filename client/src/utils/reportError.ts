import axios from "axios";

export const getReportErrorMessage = (error: unknown, notFoundMessage: string) => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  if (status === 409) return "이미 신청된 신고입니다.";
  if (status === 404) return notFoundMessage;
  return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
};
