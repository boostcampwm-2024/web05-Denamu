import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

export const adminComment = {
  remove: async (commentId: number): Promise<void> => {
    await axiosInstance.delete(ADMIN.DELETE_COMMENT(commentId));
  },
};
