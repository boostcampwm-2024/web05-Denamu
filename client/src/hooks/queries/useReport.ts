import {
  approveReport,
  GetReportsParams,
  getReports,
  rejectReport,
  reportComment,
  reportFeed,
  reportRss,
  reportUser,
} from "@/api/services/report";
import { ApproveReportPayload, CreateReportPayload } from "@/types/report";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useReportUser = () =>
  useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: CreateReportPayload }) => reportUser(userId, payload),
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
    mutationFn: ({ feedId, payload }: { feedId: number; payload: CreateReportPayload }) => reportFeed(feedId, payload),
  });

export const useReports = (params: GetReportsParams) =>
  useQuery({
    queryKey: ["adminReports", params],
    queryFn: () => getReports(params),
  });

export const useApproveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, payload }: { reportId: number; payload: ApproveReportPayload }) =>
      approveReport(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    },
  });
};

export const useRejectReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => rejectReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    },
  });
};
