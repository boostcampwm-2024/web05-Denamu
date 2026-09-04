export interface SubscribedRss {
  id: number;
  name: string;
  userName: string;
  rssUrl: string;
  blogUrl: string;
  blogPlatform: string;
  feedCount: number;
  subscriberCount: number;
  blogImage: string | null;
}

export interface Subscriber {
  id: number;
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };
}
