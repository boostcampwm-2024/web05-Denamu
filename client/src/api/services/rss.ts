import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { RegisterRss, RegisterResponse } from "@/types/rss";

export const registerRss = async (data: RegisterRss): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(BLOG.RSS.REGISTRER_RSS, data);
  return response.data;
};
