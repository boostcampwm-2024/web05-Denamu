import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { PostCommentType } from "@/types/post";

export const comments = {
  get: async (feedId: number): Promise<PostCommentType[]> => {
    const response = await axiosInstance.get<ApiData<PostCommentType[]>>(BLOG.COMMENT.LIST(feedId));
    return response.data.data;
  },
  create: async (feedId: number, comment: string): Promise<void> => {
    await axiosInstance.post(BLOG.COMMENT.LIST(feedId), { comment });
  },
  update: async (feedId: number, commentId: number, newComment: string): Promise<void> => {
    await axiosInstance.patch(BLOG.COMMENT.ITEM(feedId, commentId), { newComment });
  },
  remove: async (feedId: number, commentId: number): Promise<void> => {
    await axiosInstance.delete(BLOG.COMMENT.ITEM(feedId, commentId));
  },
};
