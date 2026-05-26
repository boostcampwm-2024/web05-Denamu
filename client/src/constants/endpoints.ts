export const BASE_URL = import.meta.env.VITE_DENAMU_URL;
export const CHAT_SERVER_URL = import.meta.env.VITE_DENAMU_URL;

export const ADMIN = {
  LOGIN: "/api/admins/login",
  CHECK: "/api/admins/session-id",
  LOGOUT: "/api/admins/logout",
  REGISTER: "/api/admins/register",
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
  POST: "/api/feeds",
  Trend: "/api/feeds/trend/sse",
  RSS: {
    REGISTRER_RSS: "/api/rss",
  },
};

export const CHART = {
  TODAY: "/api/statistics/today?limit=5",
  ALL: "/api/statistics/all?limit=5",
  PLATFORM: "/api/statistics/platform",
};

export const SEARCH = {
  GET_RESULT: "/api/feeds/search",
};

export const USER = {
  REGISTER: "/api/users/register",
  LOGIN: "/api/users/login",
  REFRESH_TOKEN: "/api/users/refresh-token",
  LOGOUT: "/api/users/logout",
  CERTIFICATE: "/api/users/certificate",
};

export const OAUTH = {
  LOGIN: "/api/oauth",
};
