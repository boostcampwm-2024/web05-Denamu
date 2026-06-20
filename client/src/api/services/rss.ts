import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData, ApiMessage } from "@/types/api";
import {
  CreateRssCertificationResult,
  CursorPage,
  OwnedRssFeedItem,
  RssCertificationPreview,
} from "@/types/profile";
import { RegisterRss, RegisterResponse } from "@/types/rss";

export const registerRss = async (data: RegisterRss): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(BLOG.RSS.REGISTRER_RSS, data);
  return response.data;
};

export const previewRssCertification = async (blogName: string): Promise<RssCertificationPreview> => {
  const response = await axiosInstance.get<ApiData<RssCertificationPreview>>(BLOG.RSS.CERTIFICATION_PREVIEW, {
    params: { blogName },
  });
  return response.data.data;
};

export const createRssCertification = async (blogName: string): Promise<CreateRssCertificationResult> => {
  const response = await axiosInstance.post<ApiData<CreateRssCertificationResult>>(BLOG.RSS.CERTIFICATION, {
    blogName,
  });
  return response.data.data;
};

export const verifyRssCertification = async (code: string): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(BLOG.RSS.CERTIFICATION_VERIFY, { code });
  return response.data;
};

export const updateRssCertification = async (
  id: number,
  data: { name: string; userName: string }
): Promise<ApiMessage> => {
  const response = await axiosInstance.patch<ApiMessage>(BLOG.RSS.CERTIFICATION_BY_ID(id), data);
  return response.data;
};

export const deleteRssCertification = async (id: number): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(BLOG.RSS.CERTIFICATION_BY_ID(id));
  return response.data;
};

export const getOwnedRssFeeds = async (
  rssId: number,
  lastId?: number,
  limit = 10
): Promise<CursorPage<OwnedRssFeedItem>> => {
  const response = await axiosInstance.get<ApiData<CursorPage<OwnedRssFeedItem>>>(BLOG.RSS.OWNED_FEEDS(rssId), {
    params: { lastId, limit },
  });
  return response.data.data;
};

export const setFeedVisibility = async (
  rssId: number,
  feedId: number,
  isPublic: boolean
): Promise<ApiMessage> => {
  const response = await axiosInstance.patch<ApiMessage>(BLOG.RSS.FEED_VISIBILITY(rssId, feedId), { isPublic });
  return response.data;
};

export const removeRss = async (code: string): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(BLOG.RSS.REMOVE_CONFIRM(code));
  return response.data;
};
