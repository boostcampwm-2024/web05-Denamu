export const BASE_URL = import.meta.env.VITE_DENAMU_URL;
export const CHAT_SERVER_URL = import.meta.env.VITE_DENAMU_URL;

export const ADMIN = {
  LOGIN: "/api/admins/login",
  ME: "/api/admins/me",
  UPDATE_ME: "/api/admins/me",
  LOGOUT: "/api/admins/logout",
  REGISTER: "/api/admins/registrations",
  CERTIFICATE: "/api/admins/email-verifications",
  CHILDREN: "/api/admins/children",
  DELETE_CHILD: (id: number) => `/api/admins/children/${id}`,
  WITHDRAW_REQUEST: "/api/admins/me/deletion-requests",
  WITHDRAW_CONFIRM: (token: string) => `/api/admins/deletion-requests/${token}`,
  PASSWORD_RESET_REQUEST: "/api/admins/password-resets",
  PASSWORD_RESET_CONFIRM: (token: string) => `/api/admins/password-resets/${token}`,
  DELETE_COMMENT: (commentId: number) => `/api/admins/comments/${commentId}`,
  CHAT: {
    ROOMS: "/api/admins/chats",
    MESSAGES: (roomId: string) => `/api/admins/chats/${roomId}`,
    DELETE: (roomId: string, messageId: string) => `/api/admins/chats/${roomId}/${messageId}`,
  },
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
  RECENT: "/api/feed/recent",
  Trend: "/api/feeds/trend/sse",
  LIKE: (id: number) => `/api/feeds/${id}/likes`,
  AI_SUMMARY: (id: number) => `/api/feeds/${id}/ai-summary-requests`,
  NO_SUMMARY: "/api/feeds/no-summary",
  COMMENT: {
    LIST: (feedId: number) => `/api/feeds/${feedId}/comments`,
    ITEM: (feedId: number, commentId: number) => `/api/feeds/${feedId}/comments/${commentId}`,
  },
  RSS: {
    REGISTRER_RSS: "/api/rss",
    CERTIFICATION: "/api/rss/certifications",
    CERTIFICATION_PREVIEW: "/api/rss/certifications/preview",
    CERTIFICATION_VERIFY: "/api/rss/certifications/verify",
    CERTIFICATION_BY_ID: (id: number) => `/api/rss/certifications/${id}`,
    OWNED_FEEDS: (id: number) => `/api/rss/certifications/${id}/feeds`,
    FEED_VISIBILITY: (id: number, feedId: number) =>
      `/api/rss/certifications/${id}/feeds/${feedId}/visibility`,
    REMOVE_CONFIRM: (code: string) => `/api/rss/remove/${code}`,
  },
};

export const TAG = {
  LIST: "/api/tags",
};

export const CHART = {
  TODAY: "/api/statistics/today?limit=5",
  ALL: "/api/statistics/all?limit=5",
  PLATFORM: "/api/statistics/platform",
};

export const SEARCH = {
  GET_RESULT: "/api/feeds/search",
  GET_USER_RESULT: "/api/users/search",
};

export const USER = {
  REGISTER: "/api/users/registrations",
  LOGIN: "/api/users/login",
  REFRESH_TOKEN: "/api/users/tokens",
  LOGOUT: "/api/users/logout",
  CERTIFICATE: "/api/users/email-verifications",
  WITHDRAW_CONFIRM: (token: string) => `/api/users/deletion-requests/${token}`,
  USERNAME_AVAILABILITY: "/api/users/username-availability",
  PASSWORD: "/api/users/password",
  DELETE_REQUEST: "/api/users/deletion-requests",
};

export const OAUTH = {
  LOGIN: "/api/oauth",
  REGISTER: "/api/oauth/registrations",
  LINKS: "/api/oauth/links",
  UNLINK: (provider: string) => `/api/oauth/links/${provider}`,
};

export const FILE = {
  UPLOAD: "/api/files",
};

export const PROFILE = {
  PROFILE: (id: number) => `/api/users/${id}/profile`,
  UPDATE: "/api/users/profile",
  RSS: (id: number) => `/api/users/${id}/rss`,
  RSS_FEEDS: (id: number, rssId: number) => `/api/users/${id}/rss/${rssId}/feeds`,
  LIKES: (id: number) => `/api/users/${id}/likes`,
  COMMENTS: (id: number) => `/api/users/${id}/comments`,
  ACTIVITIES: (id: number) => `/api/activities/${id}`,
  ACTIVITY_YEARS: (id: number) => `/api/activities/${id}/years`,
};
