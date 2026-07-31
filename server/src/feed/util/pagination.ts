import { FeedView } from '@feed/entity/feed.entity';

export function existNextFeed(feedList: FeedView[], limit: number) {
  return feedList.length > limit;
}

export function getLastIdFromFeedList(feedList: FeedView[]) {
  return feedList.length ? feedList[feedList.length - 1].feedId : 0;
}
