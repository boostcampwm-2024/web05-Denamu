import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

interface ViewResponse {
  message: number;
}

export const view = {
  increment: async (feedId: number): Promise<ViewResponse> => {
    const response = await axiosInstance.post(`${BLOG.POST}/${feedId}`);
    return response.data;
  },
};
