import { Feed } from '../feed.entity';
import { IsDefined, IsEnum, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchType {
  TITLE = 'title',
  USERNAME = 'userName',
  ALL = 'all',
}

export class SearchFeedReq {
  @IsDefined({
    message: '검색어를 입력해주세요.',
  })
  @IsString()
  find: string;
  @IsDefined({
    message: '검색 타입을 입력해주세요.',
  })
  @IsEnum(SearchType, {
    message: '검색 타입은 title, userName, all 중 하나여야 합니다.',
  })
  type: SearchType;
  @IsInt({
    message: '페이지 번호는 정수입니다.',
  })
  @Type(() => Number)
  page?: number = 1;
  @IsInt({
    message: '한 페이지에 보여줄 개수는 정수입니다.',
  })
  @Type(() => Number)
  limit?: number = 4;
}

export class SearchFeedResult {
  constructor(
    private id: number,
    private userName: string,
    private title: string,
    private path: string,
    private createdAt: Date,
  ) {}

  static feedsToResults(feeds: Feed[]): SearchFeedResult[] {
    return feeds.map((item) => {
      return new SearchFeedResult(
        item.id,
        item.blog.userName,
        item.title,
        item.path,
        item.createdAt,
      );
    });
  }
}

export class SearchFeedRes {
  constructor(
    private totalCount: number,
    private result: SearchFeedResult[],
    private totalPages: number,
    private limit: number,
  ) {}
}