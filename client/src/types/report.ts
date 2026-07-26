export type ReportTargetType = "USER" | "RSS" | "COMMENT" | "FEED";

export type ReportReason = "SPAM" | "ABUSE" | "ADULT" | "COPYRIGHT" | "PRIVACY" | "ETC";

export type ReportStatus = "PENDING" | "ACTIONED" | "REJECTED";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "스팸/광고",
  ABUSE: "욕설/혐오 표현",
  ADULT: "음란물/불건전한 콘텐츠",
  COPYRIGHT: "저작권 침해",
  PRIVACY: "개인정보 노출",
  ETC: "기타",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "미처리",
  ACTIONED: "조치완료",
  REJECTED: "반려",
};

export interface CreateReportPayload {
  reason: ReportReason;
  detail?: string;
}

export interface ReportReporter {
  id: number;
  userName: string;
}

export interface ReportItem {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  targetLabel: string | null;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  reporter: ReportReporter;
  createdAt: string;
  reviewedAt: string | null;
}
