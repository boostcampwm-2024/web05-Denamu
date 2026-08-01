import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { FeedCommentType } from "@/types/post";

export const comments = {
  get: async (feedId: number): Promise<FeedCommentType[]> => {
    const response = await axiosInstance.get<ApiData<FeedCommentType[]>>(BLOG.COMMENT.LIST(feedId));
    return response.data.data;
  },
  create: async (feedId: number, comment: string, parentId?: number): Promise<void> => {
    await axiosInstance.post(BLOG.COMMENT.LIST(feedId), { comment, parentId });
  },
  update: async (feedId: number, commentId: number, newComment: string): Promise<void> => {
    await axiosInstance.patch(BLOG.COMMENT.ITEM(feedId, commentId), { newComment });
  },
  remove: async (feedId: number, commentId: number): Promise<void> => {
    await axiosInstance.delete(BLOG.COMMENT.ITEM(feedId, commentId));
  },
};
