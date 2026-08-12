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
  userName: string;
}

export interface ReportTargetUser {
  id: number;
  userName: string;
  profileImage: string | null;
}

export interface ReportTargetFeed {
  id: number;
  title: string;
  thumbnail: string | null;
}

export interface ReportTargetRss {
  id: number;
  name: string;
  image: string | null;
}

export interface ReportTargetDetail {
  feed: ReportTargetFeed | null;
  rss: ReportTargetRss | null;
  rssOwner: ReportTargetUser | null;
  user: ReportTargetUser | null;
  comment: string | null;
}

export interface ReportItem {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  target: ReportTargetDetail;
  reason: ReportReason;
  detail: string | null;
  reporter: ReportReporter | null;
  createdAt: string;
}
