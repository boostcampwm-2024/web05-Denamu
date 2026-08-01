import { ReportReason, ReportStatus } from "@/types/report";

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
