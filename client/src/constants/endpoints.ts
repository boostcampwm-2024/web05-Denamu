export const BASE_URL = import.meta.env.VITE_DENAMU_URL;
export const CHAT_SERVER_URL = import.meta.env.VITE_DENAMU_URL;
export const ADMIN = {
  LOGIN: "/api/admin/login",
  CHECK: "/api/admin/sessionId",
  LOGOUT: "/api/admin/logout",
  REGISTER: "/api/admin/register",
  GET: {
    RSS: "/api/rss",
    ACCEPT: "/api/rss/history/accept",
    REJECT: "/api/rss/history/reject",
  },
  ACTION: {
    ACCEPT: "/api/rss/accept",
    REJECT: "/api/rss/reject",
  },
};
export const BLOG = {
  POST: "/api/feed",
  Trend:"/api/feed/trend/sse",
  RSS: {
    REGISTRER_RSS: "/api/rss",
  },
};
export const CHART = {
  TODAY: "/api/statistic/today?limit=5",
  ALL: "/api/statistic/all?limit=5",
  PLATFORM: "/api/statistic/platform",
};

export const SEARCH = {
  GET_RESULT: "/api/feed/search",
};
