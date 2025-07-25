import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RssRejectRepository,
  RssRepository,
  RssAcceptRepository,
} from '../repository/rss.repository';
import { RssRegisterRequestDto } from '../dto/request/rss-register.dto';
import { EmailService } from '../../common/email/email.service';
import { DataSource } from 'typeorm';
import { Rss, RssReject, RssAccept } from '../entity/rss.entity';
import { FeedCrawlerService } from '../../feed/service/feed-crawler.service';
import { RssReadResponseDto } from '../dto/response/rss-all.dto';
import { RssAcceptHistoryResponseDto } from '../dto/response/rss-accept-history.dto';
import { RssRejectHistoryResponseDto } from '../dto/response/rss-reject-history.dto';
import { RssManagementRequestDto } from '../dto/request/rss-management.dto';
import { RejectRssRequestDto } from '../dto/request/rss-reject.dto';
import { RequestDeleteRssDto } from '../dto/request/rss-request-delete.dto';
import { RedisService } from '../../common/redis/redis.service';
import { DeleteRssDto } from '../dto/request/rss-delete.dto';
import { FeedRepository } from '../../feed/repository/feed.repository';

@Injectable()
export class RssService {
  constructor(
    private readonly rssRepository: RssRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
    private readonly rssRejectRepository: RssRejectRepository,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    private readonly feedCrawlerService: FeedCrawlerService,
    private readonly redisService: RedisService,
    private readonly feedRepository: FeedRepository,
  ) {}

  async createRss(rssRegisterBodyDto: RssRegisterRequestDto) {
    const [alreadyURLRss, alreadyURLBlog] = await Promise.all([
      this.rssRepository.findOne({
        where: {
          rssUrl: rssRegisterBodyDto.rssUrl,
        },
      }),
      this.rssAcceptRepository.findOne({
        where: {
          rssUrl: rssRegisterBodyDto.rssUrl,
        },
      }),
    ]);

    if (alreadyURLRss || alreadyURLBlog) {
      throw new ConflictException(
        alreadyURLRss
          ? '이미 신청된 RSS URL입니다.'
          : '이미 등록된 RSS URL입니다.',
      );
    }

    await this.rssRepository.insert(rssRegisterBodyDto.toEntity());
  }

  async readAllRss() {
    const rssList = await this.rssRepository.find();
    return RssReadResponseDto.toResponseDtoArray(rssList);
  }

  async acceptRss(rssAcceptParamDto: RssManagementRequestDto) {
    const rssId = rssAcceptParamDto.id;
    const rss = await this.rssRepository.findOne({
      where: { id: rssId },
    });

    if (!rss) {
      throw new NotFoundException('신청 목록에서 사라진 등록 요청입니다.');
    }

    const rssXmlResponse = await fetch(rss.rssUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!rssXmlResponse.ok) {
      throw new BadRequestException(`${rss.rssUrl}이 올바른 RSS가 아닙니다.`);
    }

    this.acceptRssBackProcess(rss, rssXmlResponse);
  }

  async rejectRss(
    rssRejectParamDto: RssManagementRequestDto,
    rssRejectBodyDto: RejectRssRequestDto,
  ) {
    const rssId = rssRejectParamDto.id;
    const rss = await this.rssRepository.findOne({
      where: { id: rssId },
    });

    if (!rss) {
      throw new NotFoundException('신청 목록에서 사라진 등록 요청입니다.');
    }

    const rejectRss = await this.dataSource.transaction(async (manager) => {
      const [rejectRss] = await Promise.all([
        manager.remove(rss),
        manager.save(RssReject, {
          ...rss,
          description: rssRejectBodyDto.description,
        }),
      ]);
      return rejectRss;
    });
    this.emailService.sendRssMail(
      rejectRss,
      false,
      rssRejectBodyDto.description,
    );
  }

  async readAcceptHistory() {
    const acceptRssList = await this.rssAcceptRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return RssAcceptHistoryResponseDto.toResponseDtoArray(acceptRssList);
  }

  async readRejectHistory() {
    const rejectRssList = await this.rssRejectRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return RssRejectHistoryResponseDto.toResponseDtoArray(rejectRssList);
  }

  private identifyPlatformFromRssUrl(rssUrl: string) {
    type Platform = 'medium' | 'tistory' | 'velog' | 'github' | 'etc';

    const platformRegexp: { [key in Platform]: RegExp } = {
      medium: /^https:\/\/medium\.com/,
      tistory: /^https:\/\/[a-zA-Z0-9\-]+\.tistory\.com/,
      velog: /^https:\/\/v2\.velog\.io/,
      github: /^https:\/\/[\w\-]+\.github\.io/,
      etc: /.*/,
    };

    for (const platform in platformRegexp) {
      if (platformRegexp[platform].test(rssUrl)) {
        return platform;
      }
    }
    return 'etc';
  }

  private async acceptRssBackProcess(rss: Rss, rssXmlResponse: Response) {
    const blogPlatform = this.identifyPlatformFromRssUrl(rss.rssUrl);

    const [rssAccept, feeds] = await this.dataSource.transaction(
      async (manager) => {
        const [rssAccept] = await Promise.all([
          manager.save(RssAccept.fromRss(rss, blogPlatform)),
          manager.delete(Rss, rss.id),
        ]);
        const feeds =
          await this.feedCrawlerService.parseRssFeeds(rssXmlResponse);
        return [rssAccept, feeds];
      },
    );

    const feedsWithId = await this.feedCrawlerService.saveRssFeeds(
      feeds,
      rssAccept,
    );
    this.feedCrawlerService.saveAiQueue(feedsWithId);
    this.emailService.sendRssMail(rssAccept, true);
  }

  async requestRemove(requestDeleteRssDto: RequestDeleteRssDto) {
    const [rssAccept, rssWait] = await Promise.all([
      this.rssAcceptRepository.findOne({
        where: {
          rssUrl: requestDeleteRssDto.blogUrl,
          email: requestDeleteRssDto.email,
        },
      }),
      this.rssRepository.findOne({
        where: {
          rssUrl: requestDeleteRssDto.blogUrl,
          email: requestDeleteRssDto.email,
        },
      }),
    ]);

    if (!rssAccept && !rssWait) {
      throw new NotFoundException('RSS 데이터를 찾을 수 없습니다.');
    }

    const certificateCode = this.generateRandomAlphaNumeric();

    await this.redisService.set(
      `rss:remove:${certificateCode}`,
      requestDeleteRssDto.blogUrl,
      'EX',
      300,
    );

    this.emailService.sendRssRemoveCertificationMail(
      rssAccept?.userName ?? rssWait.userName,
      requestDeleteRssDto.email,
      requestDeleteRssDto.blogUrl,
      certificateCode,
    );
  }

  private generateRandomAlphaNumeric(length = 6): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * charset.length);
      result += charset[index];
    }

    return result;
  }

  async deleteRss(deleteRssDto: DeleteRssDto) {
    const rssUrl = await this.redisService.get(
      `rss:remove:${deleteRssDto.code}`,
    );

    if (!rssUrl) {
      throw new NotFoundException(
        'RSS 삭제 요청 인증 코드가 만료되었거나 찾을 수 없습니다.',
      );
    }

    const rss = await this.rssAcceptRepository.findOne({
      where: {
        rssUrl: rssUrl,
      },
    });

    if (!rss) {
      await this.redisService.del(`rss:remove;${deleteRssDto.code}`);
      throw new NotFoundException('이미 지워진 RSS 정보입니다.');
    }

    await this.feedRepository.delete({
      blog: {
        id: rss.id,
      },
    });
  }
}
