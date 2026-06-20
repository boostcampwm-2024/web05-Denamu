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
  LIKE: (id: number) => `/api/feeds/${id}/likes`,
  RSS: {
    REGISTRER_RSS: "/api/rss",
    CERTIFICATION: "/api/rss/certifications",
    CERTIFICATION_PREVIEW: "/api/rss/certifications/preview",
    CERTIFICATION_VERIFY: "/api/rss/certifications/verify",
    CERTIFICATION_BY_ID: (id: number) => `/api/rss/certifications/${id}`,
    REMOVE_CONFIRM: (code: string) => `/api/rss/remove/${code}`,
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
};

export const FILE = {
  UPLOAD: "/api/files",
};

export const PROFILE = {
  PROFILE: (id: number) => `/api/users/${id}/profile`,
  UPDATE: "/api/users/profile",
  RSS: (id: number) => `/api/users/${id}/rss`,
  LIKES: (id: number) => `/api/users/${id}/likes`,
  COMMENTS: (id: number) => `/api/users/${id}/comments`,
  ACTIVITIES: (id: number) => `/api/activities/${id}`,
  ACTIVITY_YEARS: (id: number) => `/api/activities/${id}/years`,
};
