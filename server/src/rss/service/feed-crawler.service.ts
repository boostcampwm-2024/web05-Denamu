import { Injectable } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { RssParserService } from '../service/rss-parser.service';
import { Feed } from '../../feed/entity/feed.entity';
import { RssAccept } from '../entity/rss.entity';
import { RedisService } from '../../common/redis/redis.service';
import { redisKeys } from '../../common/redis/redis.constant';
import * as sanitize from 'sanitize-html';

@Injectable()
export class FeedCrawlerService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly rssParser: RssParserService,
    private readonly redisService: RedisService,
  ) {}
  async parseRssFeeds(
    rssXmlResponse: Response,
  ): Promise<Partial<Feed & { content: string }>[]> {
    const xmlParser = new XMLParser();

    const xmlData = await rssXmlResponse.text();
    const objFromXml = xmlParser.parse(xmlData);

    if (!Array.isArray(objFromXml.rss.channel.item)) {
      objFromXml.rss.channel.item = [objFromXml.rss.channel.item];
    }

    return await Promise.all(
      objFromXml.rss.channel.item.map(async (feed) => {
        const date = new Date(feed.pubDate);
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
        const thumbnail = await this.rssParser.getThumbnailUrl(feed.link);
        const content = sanitize(feed.description ?? feed.content['encoded'], {
          allowedTags: [],
        }).replace(/[\n\r\t\s]+/g, ' ');

        return {
          title: this.rssParser.customUnescape(feed.title),
          path: decodeURIComponent(feed.link),
          thumbnail,
          createdAt: formattedDate,
          summary: '아직 AI가 요약을 진행중인 게시글 이에요! 💭',
          content,
        };
      }),
    );
  }

  async saveRssFeeds(
    feeds: Partial<Feed & { content: string }>[],
    newRssAccept: RssAccept,
  ) {
    feeds.forEach((feed) => (feed.blog = newRssAccept));
    const insertResult = await this.feedRepository.insert(feeds);

    const insertedFeeds = feeds.filter((feed, index) => {
      const id = insertResult.identifiers[index]?.id;
      feed.id = id;
      return id !== undefined;
    });

    return insertedFeeds;
  }

  async saveAiQueue(feeds: Partial<Feed & { content: string }>[]) {
    await this.redisService.executePipeline((pipeline) => {
      feeds.forEach((feed) => {
        pipeline.lpush(
          redisKeys.FEED_AI_QUEUE,
          JSON.stringify({ id: feed.id, content: feed.content, deathCount: 0 }),
        );
      });
    });
  }
}
