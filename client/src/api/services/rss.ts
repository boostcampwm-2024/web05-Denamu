import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { RegisterRss, RegisterResponse } from "@/types/rss";

export const registerRss = async (data: RegisterRss): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(BLOG.RSS.REGISTRER_RSS, data);
  return response.data;
};

export const verifyRssCertification = async (code: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(BLOG.RSS.CERTIFICATION_VERIFY, { code });
  return response.data;
};

export const removeRss = async (code: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(BLOG.RSS.REMOVE_CONFIRM(code));
  return response.data;
};
