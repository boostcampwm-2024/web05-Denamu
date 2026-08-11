export const TOAST_MESSAGES = {
  SERVICE_NOT_PREPARED: {
    title: "서비스 준비 중",
    description: "서비스가 현재 개발 중입니다. 곧 만나요!",
    variant: "default",
    duration: 3000,
  },
  COPY_COMPLETE: {
    title: "복사 성공",
    description: "링크가 클립보드에 저장되었어요! ",
  },
  SESSION_EXPIRED: {
    title: "세션 만료",
    description: "로그인이 만료되었어요. 다시 로그인해주세요.",
    variant: "destructive",
    duration: 3000,
  },
} as const;
