import { RssAccept } from '../../entity/rss.entity';

export class RssAcceptHistoryResponseDto {
  private constructor(
    private id: number,
    private name: string,
    private userName: string,
    private email: string,
    private rssUrl: string,
    private blogPlatform: string,
  ) {}

  static toResponseDto(rssAccept: RssAccept) {
    return new RssAcceptHistoryResponseDto(
      rssAccept.id,
      rssAccept.name,
      rssAccept.userName,
      rssAccept.email,
      rssAccept.rssUrl,
      rssAccept.blogPlatform,
    );
  }

  static toResponseDtoArray(rssAcceptList: RssAccept[]) {
    return rssAcceptList.map(this.toResponseDto);
  }
}
