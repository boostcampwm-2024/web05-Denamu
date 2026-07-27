import { useMutation, useQuery } from "@tanstack/react-query";

import { GetReportsParams, getReports, reportComment, reportFeed, reportRss, reportUser } from "@/api/services/report";

import { CreateReportPayload } from "@/types/report";

export const useReportUser = () =>
  useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: CreateReportPayload }) =>
      reportUser(userId, payload),
  });

export const useReportRss = () =>
  useMutation({
    mutationFn: ({ rssId, payload }: { rssId: number; payload: CreateReportPayload }) => reportRss(rssId, payload),
  });

export const useReportComment = () =>
  useMutation({
    mutationFn: ({ commentId, payload }: { commentId: number; payload: CreateReportPayload }) =>
      reportComment(commentId, payload),
  });

export const useReportFeed = () =>
  useMutation({
    mutationFn: ({ feedId, payload }: { feedId: number; payload: CreateReportPayload }) =>
      reportFeed(feedId, payload),
  });

export const useReports = (params: GetReportsParams) =>
  useQuery({
    queryKey: ["adminReports", params],
    queryFn: () => getReports(params),
  });
