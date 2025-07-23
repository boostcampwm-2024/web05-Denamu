import { FeedDetail, RssObj } from '../types';

export interface FeedParser {
  /**
   * 피드 URL에서 FeedDetail 목록을 파싱하여 반환
   */
  parseFeed(rssObj: RssObj, xmlData: string): Promise<FeedDetail[]>;

  /**
   * 해당 파서가 주어진 XML 형식에 대해 파싱이 가능한지 여부를 반환
   */
  canParse(xmlData: string): boolean;
}
