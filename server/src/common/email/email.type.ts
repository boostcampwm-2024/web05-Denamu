export interface Rss {
  name: string;
  userName: string;
  email: string;
  rssUrl: string;
}

export interface RssRegistration {
  rss: Rss;
  approveFlag: boolean;
  description?: string;
}

export interface User {
  email: string;
  userName: string;
  uuid: string;
}

export interface RssRemoval {
  userName: string;
  email: string;
  rssUrl: string;
  certificateCode: string;
}

export type EmailPayload =
  | { type: 'userCertification'; data: User }
  | { type: 'rssRemove'; data: RssRemoval }
  | { type: 'rssRegistration'; data: RssRegistration }
  | { type: 'resetPassword'; data: User }
  | { type: 'deleteAccount'; data: User };
