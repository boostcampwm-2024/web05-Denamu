import { REPORT } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

import { ApiData, ApiMessage } from "@/types/api";
import { CursorPage } from "@/types/profile";
import { CreateReportPayload, ReportItem, ReportStatus, ReportTargetType } from "@/types/report";

export const reportUser = async (userId: number, payload: CreateReportPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(REPORT.USER(userId), payload);
  return response.data;
};

export const reportRss = async (rssId: number, payload: CreateReportPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(REPORT.RSS(rssId), payload);
  return response.data;
};

export const reportComment = async (commentId: number, payload: CreateReportPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(REPORT.COMMENT(commentId), payload);
  return response.data;
};

export const reportFeed = async (feedId: number, payload: CreateReportPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(REPORT.FEED(feedId), payload);
  return response.data;
};

export interface GetReportsParams {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  lastId?: number;
  limit?: number;
}

export const getReports = async (params: GetReportsParams): Promise<CursorPage<ReportItem>> => {
  const response = await axiosInstance.get<ApiData<CursorPage<ReportItem>>>(REPORT.ADMIN_LIST, { params });
  return response.data.data;
};
