export const redisConstant = {
  FEED_RECENT_INDEX_KEY: 'feed:recent:index',
  FEED_INFO_ITEM_KEY: (feedId: number | string) => `feed:info:${feedId}`,
  FEED_INFO_TTL_SECONDS: 1800,
  FEED_AI_QUEUE: `feed:ai:queue`,
  FEED_AI_RETRY_LOCK: `feed:ai-retry:lock`,
};
