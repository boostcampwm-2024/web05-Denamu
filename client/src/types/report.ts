export type ReportTargetType = "USER" | "RSS" | "COMMENT" | "FEED";

export type ReportReason = "SPAM" | "ABUSE" | "ADULT" | "COPYRIGHT" | "PRIVACY" | "ETC";

export type ReportStatus = "PENDING" | "ACTIONED" | "REJECTED";

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
