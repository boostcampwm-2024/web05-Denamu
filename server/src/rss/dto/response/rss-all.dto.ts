import { Rss } from '../../entity/rss.entity';

export class RssReadResponseDto {
  private constructor(
    private id: number,
    private name: string,
    private userName: string,
    private email: string,
    private rssUrl: string,
  ) {}

  static toResponseDto(rss: Rss) {
    return new RssReadResponseDto(
      rss.id,
      rss.name,
      rss.userName,
      rss.email,
      rss.rssUrl,
    );
  }

  static toResponseDtoArray(rssList: Rss[]) {
    return rssList.map(this.toResponseDto);
  }
}
