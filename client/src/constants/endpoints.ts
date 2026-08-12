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
    RSS: "/api/admins/rss",
    ACCEPT: "/api/admins/rss/acceptances",
    REJECT: "/api/admins/rss/rejections",
  },
  ACTION: {
    ACCEPT: (id: number) => `/api/admins/rss/${id}/acceptances`,
    REJECT: (id: number) => `/api/admins/rss/${id}/rejections`,
  },
  FEED: {
    NO_SUMMARY: "/api/admins/feeds/no-summary",
    AI_SUMMARY: (id: number) => `/api/admins/feeds/${id}/ai-summary-requests`,
  },
};

export const BLOG = {
  POST: "/api/feeds",
  RECENT: "/api/feed/recent",
  Trend: "/api/feeds/trend/sse",
  LIKE: (id: number) => `/api/feeds/${id}/likes`,
  COMMENT: {
    LIST: (feedId: number) => `/api/feeds/${feedId}/comments`,
    ITEM: (feedId: number, commentId: number) => `/api/feeds/${feedId}/comments/${commentId}`,
  },
  RSS: {
    REGISTRER_RSS: "/api/rss",
    RECENT: "/api/rss/recent",
    INFO: (id: number) => `/api/rss/${id}`,
    FEEDS: (id: number) => `/api/rss/${id}/feeds`,
    ACTIVITIES: (id: number) => `/api/rss/${id}/activities`,
    ACTIVITY_YEARS: (id: number) => `/api/rss/${id}/activities/years`,
    CERTIFICATION: "/api/rss/certifications",
    CERTIFICATION_PREVIEW: "/api/rss/certifications/preview",
    CERTIFICATION_VERIFY: "/api/rss/certifications/verify",
    CERTIFICATION_BY_ID: (id: number) => `/api/rss/certifications/${id}`,
    OWNED_FEEDS: (id: number) => `/api/rss/certifications/${id}/feeds`,
    FEED_VISIBILITY: (id: number, feedId: number) => `/api/rss/certifications/${id}/feeds/${feedId}/visibility`,
    REMOVE_CONFIRM: (code: string) => `/api/rss/remove/${code}`,
  },
};

export const SUBSCRIPTION = {
  CREATE: (rssId: number) => `/api/rss/${rssId}/subscriptions`,
  REMOVE: (rssId: number) => `/api/rss/${rssId}/subscriptions`,
  SUBSCRIBERS: (rssId: number) => `/api/rss/${rssId}/subscribers`,
  BY_USER: (userId: number) => `/api/users/${userId}/subscriptions`,
  FEED: "/api/feeds/subscriptions",
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
  GET_RSS_RESULT: "/api/rss/search",
};

export const USER = {
  REGISTER: "/api/users/registrations",
  LOGIN: "/api/users/login",
  REFRESH_TOKEN: "/api/users/tokens",
  LOGOUT: "/api/users/logout",
  CERTIFICATE: "/api/users/email-verifications",
  PASSWORD_RESET: "/api/users/password-resets",
  PASSWORD_RESET_CONFIRM: (uuid: string) => `/api/users/password-resets/${uuid}`,
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

export const BLOCK = {
  LIST: "/api/blocks/user",
  MANAGE: (userId: number) => `/api/blocks/user/${userId}`,
  RSS_LIST: "/api/blocks/rss",
  RSS_MANAGE: (rssId: number) => `/api/blocks/rss/${rssId}`,
};

export const REPORT = {
  USER: (userId: number) => `/api/reports/users/${userId}`,
  RSS: (rssId: number) => `/api/reports/rss/${rssId}`,
  COMMENT: (commentId: number) => `/api/reports/comments/${commentId}`,
  FEED: (feedId: number) => `/api/reports/feeds/${feedId}`,
  ADMIN_LIST: "/api/admins/reports",
  ADMIN_APPROVE: (reportId: number) => `/api/admins/reports/${reportId}/suspensions`,
  ADMIN_REJECT: (reportId: number) => `/api/admins/reports/${reportId}`,
};

export const SUSPENSION = {
  ADMIN_LIST: "/api/admins/user-suspensions",
  ADMIN_UPDATE: (userId: number) => `/api/admins/user-suspensions/${userId}`,
};

export const FILE = {
  UPLOAD: "/api/files",
  ADMIN_UPLOAD_IMAGE: "/api/admins/images",
};

export const BOARD = {
  LIST: "/api/boards",
  DETAIL: (id: number) => `/api/boards/${id}`,
  ADMIN_LIST: "/api/admins/boards",
  ADMIN_DETAIL: (id: number) => `/api/admins/boards/${id}`,
};

export const MARKETING_EMAIL = {
  ADMIN_LIST: "/api/admins/marketing-emails",
  ADMIN_DETAIL: (id: number) => `/api/admins/marketing-emails/${id}`,
};

export const QNA = {
  LIST: "/api/qna",
  DETAIL: (id: number) => `/api/qna/${id}`,
  VERIFY: (id: number) => `/api/qna/${id}/verify`,
  MESSAGES: (id: number) => `/api/qna/${id}/messages`,
  ADMIN_LIST: "/api/admins/qna",
  ADMIN_DETAIL: (id: number) => `/api/admins/qna/${id}`,
  ADMIN_MESSAGES: (id: number) => `/api/admins/qna/${id}/messages`,
};

export const NOTIFICATION = {
  UNREAD_COUNT: "/api/notifications/unread-count",
  LIST: "/api/notifications",
  READ: (id: number) => `/api/notifications/${id}/read`,
};

export const PROFILE = {
  PROFILE: (id: number) => `/api/users/${id}/profile`,
  UPDATE: "/api/users/profile",
  UPDATE_IMAGE: "/api/users/profile-image",
  RSS: (id: number) => `/api/users/${id}/rss`,
  LIKES: (id: number) => `/api/users/${id}/likes`,
  COMMENTS: (id: number) => `/api/users/${id}/comments`,
  ACTIVITIES: (id: number) => `/api/activities/${id}`,
  ACTIVITY_YEARS: (id: number) => `/api/activities/${id}/years`,
};
