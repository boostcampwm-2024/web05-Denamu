import { RssReject } from '../../entity/rss.entity';

export class RssRejectHistoryResponseDto {
  private constructor(
    private id: number,
    private name: string,
    private userName: string,
    private email: string,
    private rssUrl: string,
    private description: string,
  ) {}

  static toResponseDto(rssReject: RssReject) {
    return new RssRejectHistoryResponseDto(
      rssReject.id,
      rssReject.name,
      rssReject.userName,
      rssReject.email,
      rssReject.rssUrl,
      rssReject.description,
    );
  }

  static toResponseDtoArray(rssRejectList: RssReject[]) {
    return rssRejectList.map(this.toResponseDto);
  }
}
