export type ReportTargetType = "USER" | "RSS" | "COMMENT" | "FEED";

export type ReportReason = "SPAM" | "ABUSE" | "ADULT" | "COPYRIGHT" | "PRIVACY" | "ETC";

export interface CreateReportPayload {
  reason: ReportReason;
  detail?: string;
}

export type SuspensionPreset = "ONE_DAY" | "SEVEN_DAYS" | "ONE_MONTH" | "SIX_MONTHS" | "PERMANENT";

export interface ApproveReportPayload {
  suspendedUntil?: string;
  detail: string;
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
  reporter: ReportReporter;
  createdAt: string;
  reviewedAt: string | null;
}
