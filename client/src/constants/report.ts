import { ReportReason, SuspensionPreset } from "@/types/report";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "스팸/광고",
  ABUSE: "욕설/혐오 표현",
  ADULT: "음란물/불건전한 콘텐츠",
  COPYRIGHT: "저작권 침해",
  PRIVACY: "개인정보 노출",
  ETC: "기타",
};

export const SUSPENSION_PRESET_LABELS: Record<SuspensionPreset, string> = {
  ONE_DAY: "1일",
  SEVEN_DAYS: "7일",
  ONE_MONTH: "1개월",
  SIX_MONTHS: "6개월",
  PERMANENT: "영구정지",
};

export const SUSPENSION_PRESET_DAYS: Partial<Record<SuspensionPreset, number>> = {
  ONE_DAY: 1,
  SEVEN_DAYS: 7,
  ONE_MONTH: 30,
  SIX_MONTHS: 180,
};
