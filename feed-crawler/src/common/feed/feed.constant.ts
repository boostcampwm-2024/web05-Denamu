export const ONE_MINUTE = 60 * 1000;
export const TIME_INTERVAL =
  process.env.NODE_ENV !== 'TEST'
    ? parseInt(process.env.TIME_INTERVAL)
    : Number.MAX_SAFE_INTEGER;

export const FEED_AI_SUMMARY_IN_PROGRESS_MESSAGE = `아직 AI가 요약을 진행중인 게시글 이에요! 💭`;
