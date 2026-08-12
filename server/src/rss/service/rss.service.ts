import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as uuid from 'uuid';
import axios from 'axios';
import { DataSource, IsNull } from 'typeorm';

import {
  DailyActivityDto,
  ReadActivityResponseDto,
} from '@activity/dto/response/readActivity.dto';

import { AdminRepository } from '@admin/repository/admin.repository';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { EmailProducer } from '@common/email/email.producer';
import { Payload } from '@common/guard/jwt.guard';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { RSS_NOTIFIER } from '@common/notification/notifier.constant';
import {
  RMQ_EXCHANGES,
  RMQ_ROUTING_KEYS,
} from '@common/rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@common/rabbitmq/rabbitmq.service';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { DeleteCertificateRssRequestDto } from '@rss/dto/request/deleteCertificateRss.dto';
import { DeleteRssRequestDto } from '@rss/dto/request/deleteRss.dto';
import { GetAllRssRequestDto } from '@rss/dto/request/getAllRss.dto';
import { GetOwnedRssFeedsRequestDto } from '@rss/dto/request/getOwnedRssFeeds.dto';
import { GetRssFeedsRequestDto } from '@rss/dto/request/getRssFeeds.dto';
import { ManageRssRequestDto } from '@rss/dto/request/manageRss.dto';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { RejectRssRequestDto } from '@rss/dto/request/rejectRss';
import { SearchRssRequestDto } from '@rss/dto/request/searchRss.dto';
import { CreateRssCertificationResponseDto } from '@rss/dto/response/createRssCertification.dto';
import { GetOwnedRssFeedsResponseDto } from '@rss/dto/response/getOwnedRssFeeds.dto';
import { GetRecentRssResponseDto } from '@rss/dto/response/getRecentRss.dto';
import { GetRssFeedsResponseDto } from '@rss/dto/response/getRssFeeds.dto';
import { GetRssInfoResponseDto } from '@rss/dto/response/getRssInfo.dto';
import { PreviewRssCertificationResponseDto } from '@rss/dto/response/previewRssCertification.dto';
import { ReadRssResponseDto } from '@rss/dto/response/readRss.dto';
import { ReadRssAcceptHistoryResponseDto } from '@rss/dto/response/readRssAcceptHistory.dto';
import { ReadRssRejectHistoryResponseDto } from '@rss/dto/response/readRssRejectHistory.dto';
import {
  SearchRssResponseDto,
  SearchRssResult,
} from '@rss/dto/response/searchRss.dto';
import { Rss, RssAccept, RssReject } from '@rss/entity/rss.entity';
import {
  RssAcceptRepository,
  RssRejectRepository,
  RssRepository,
} from '@rss/repository/rss.repository';
import { assertUrlAccessible } from '@rss/util/assertUrlAccessible';
import { blogUrlToRss } from '@rss/util/blogUrlToRss';
import { fetchChannelImage } from '@rss/util/fetchChannelImage';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

@Injectable()
export class RssService {
  private static readonly RECENT_RSS_LIMIT = 10;

  constructor(
    private readonly rssRepository: RssRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
    private readonly rssRejectRepository: RssRejectRepository,
    private readonly feedRepository: FeedRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly emailProducer: EmailProducer,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly adminRepository: AdminRepository,
    @Inject(RSS_NOTIFIER) private readonly notifierRegistry: NotifierRegistry,
    private readonly logger: WinstonLoggerService,
    private readonly rssBlockRepository: RssBlockRepository,
  ) {}

  async createRss(rssRegisterBodyDto: RegisterRssRequestDto) {
    const { blogName, blogUrl, blogPlatform } = rssRegisterBodyDto;
    const rssUrl =
      blogPlatform === 'etc'
        ? rssRegisterBodyDto.rssUrl
        : blogUrlToRss(blogPlatform, blogUrl);

    const [duplicateRss, duplicateBlog] = await Promise.all([
      this.rssRepository.findOne({
        where: [{ rssUrl }, { name: blogName }],
      }),
      this.rssAcceptRepository.findOne({
        where: [{ rssUrl }, { name: blogName }],
      }),
    ]);

    if (duplicateRss || duplicateBlog) {
      const status = duplicateRss ? '신청' : '등록';
      const duplicate = duplicateRss ?? duplicateBlog;
      const field = duplicate.rssUrl === rssUrl ? 'RSS URL' : '블로그 이름';
      throw new ConflictException(`이미 ${status}된 ${field}입니다.`);
    }

    await Promise.all([
      assertUrlAccessible(blogUrl),
      assertUrlAccessible(rssUrl),
    ]);

    const rssEntity = rssRegisterBodyDto.toEntity(rssUrl);
    rssEntity.blogImage = await fetchChannelImage(rssUrl);
    await this.rssRepository.insert(rssEntity);

    void this.notifyRssRegistrationRequest(rssEntity);
  }

  private async notifyRssRegistrationRequest(rss: Rss) {
    void this.notifierRegistry.sendAlert(
      `📥 새로운 RSS 등록 신청이 접수되었습니다.\n블로그: ${rss.name}(rss.blogUrl)\n신청자: ${rss.userName}\nRSS: ${rss.rssUrl}`,
    );

    try {
      const admins = await this.adminRepository.find({
        where: { emailNotification: true },
        select: ['email'],
      });

      await Promise.all(
        admins.map((admin) =>
          this.emailProducer.produceRssRegistrationRequest(rss, admin.email),
        ),
      );
    } catch (error) {
      this.logger.error(
        `RSS 등록 신청 알림 발송 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async readAllRss() {
    const rssList = await this.rssRepository.find();
    return ReadRssResponseDto.toResponseDtoArray(rssList);
  }

  async acceptRss(rssAcceptParamDto: ManageRssRequestDto) {
    const rssId = rssAcceptParamDto.id;
    const rss = await this.rssRepository.findOne({
      where: { id: rssId },
    });

    if (!rss) {
      throw new NotFoundException('신청 목록에서 사라진 등록 요청입니다.');
    }

    try {
      await axios.get(rss.rssUrl, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });
    } catch {
      throw new BadRequestException(`${rss.rssUrl}이 올바른 RSS가 아닙니다.`);
    }

    await this.acceptRssBackProcess(rss);
  }

  async rejectRss(
    rssRejectParamDto: ManageRssRequestDto,
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
      const rejectRss = await manager.remove(rss);
      await manager.save(RssReject, {
        ...rss,
        description: rssRejectBodyDto.description,
      });
      return rejectRss;
    });
    void this.notifyRssRejected(rejectRss, rssRejectBodyDto.description);
  }

  private async notifyRssRejected(rss: Rss, description?: string) {
    try {
      await this.emailProducer.produceRssRegistration(rss, false, description);
    } catch (error) {
      this.logger.error(
        `RSS 거절 메일 발송 실패 (rssId: ${rss.id}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async readAcceptHistory() {
    const acceptRssList = await this.rssAcceptRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return ReadRssAcceptHistoryResponseDto.toResponseDtoArray(acceptRssList);
  }

  async readRejectHistory() {
    const rejectRssList = await this.rssRejectRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return ReadRssRejectHistoryResponseDto.toResponseDtoArray(rejectRssList);
  }

  private async acceptRssBackProcess(rss: Rss) {
    const rssAccept = await this.dataSource.transaction(async (manager) => {
      const rssAccept = await manager.save(RssAccept.fromRss(rss));
      await manager.delete(Rss, rss.id);
      return rssAccept;
    });

    await this.enqueueFullFeedCrawlMessage(rssAccept.id);
    void this.notifyRssAccepted(rssAccept);
  }

  private async notifyRssAccepted(rssAccept: RssAccept) {
    try {
      await this.emailProducer.produceRssRegistration(rssAccept, true);
    } catch (error) {
      this.logger.error(
        `RSS 승인 메일 발송 실패 (rssId: ${rssAccept.id}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async enqueueFullFeedCrawlMessage(rssId: number) {
    await this.rabbitMQService.sendMessage(
      RMQ_EXCHANGES.CRAWLING,
      RMQ_ROUTING_KEYS.CRAWLING_FULL,
      String(rssId),
    );
  }

  async requestRemove(requestDeleteRssDto: DeleteRssRequestDto) {
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

    const certificateCode = uuid.v4();

    await this.redisService.set(
      `${REDIS_KEYS.RSS_REMOVE_KEY}:${certificateCode}`,
      requestDeleteRssDto.blogUrl,
      'EX',
      300,
    );

    await this.emailProducer.produceRssRemoval(
      rssAccept?.userName ?? rssWait.userName,
      requestDeleteRssDto.email,
      requestDeleteRssDto.blogUrl,
      certificateCode,
    );
  }

  async deleteRss(deleteRssDto: DeleteCertificateRssRequestDto) {
    const redisKey = `${REDIS_KEYS.RSS_REMOVE_KEY}:${deleteRssDto.code}`;
    const rssUrl = await this.redisService.get(redisKey);

    if (!rssUrl) {
      throw new NotFoundException(
        'RSS 삭제 요청 인증 코드가 만료되었거나 찾을 수 없습니다.',
      );
    }

    try {
      const [rssAccept, rss] = await Promise.all([
        this.rssAcceptRepository.delete({ rssUrl }),
        this.rssRepository.delete({ rssUrl }),
      ]);

      if (rssAccept.affected === 0 && rss.affected === 0) {
        throw new NotFoundException('이미 지워진 RSS 정보입니다.');
      }
    } finally {
      await this.redisService.del(redisKey);
    }
  }

  async getRecentRss(viewerId?: number) {
    const recentRssList = await this.rssAcceptRepository.findRecentlyPublished(
      RssService.RECENT_RSS_LIMIT,
      viewerId,
    );
    return recentRssList.map((row) =>
      GetRecentRssResponseDto.toResponseDto(row),
    );
  }

  async getAllRss(getAllRssQueryDto: GetAllRssRequestDto, viewerId?: number) {
    const { page, limit, blogPlatform } = getAllRssQueryDto;
    const offset = (page - 1) * limit;

    const [rssAcceptList, totalCount] =
      await this.rssAcceptRepository.findAllRssList(
        limit,
        offset,
        viewerId,
        blogPlatform,
      );

    const blogIds = rssAcceptList.map((rss) => rss.id);
    const [feedCountMap, lastPublishedAtMap] = await Promise.all([
      this.feedRepository.countPublicFeedsByBlogIds(blogIds),
      this.feedRepository.getLatestPublicFeedDateByBlogIds(blogIds),
    ]);

    const rssList = SearchRssResult.toResultDtoArray(
      rssAcceptList,
      feedCountMap,
      lastPublishedAtMap,
    );
    const totalPages = Math.ceil(totalCount / limit);

    return SearchRssResponseDto.toResponseDto(
      totalCount,
      rssList,
      totalPages,
      limit,
    );
  }

  async searchRss(searchRssQueryDto: SearchRssRequestDto, viewerId?: number) {
    const { find, page, limit } = searchRssQueryDto;
    const offset = (page - 1) * limit;

    const [searchResult, totalCount] =
      await this.rssAcceptRepository.searchRssList(
        find,
        limit,
        offset,
        viewerId,
      );

    const feedCountMap = await this.feedRepository.countPublicFeedsByBlogIds(
      searchResult.map((rss) => rss.id),
    );

    const rssList = SearchRssResult.toResultDtoArray(
      searchResult,
      feedCountMap,
    );
    const totalPages = Math.ceil(totalCount / limit);

    return SearchRssResponseDto.toResponseDto(
      totalCount,
      rssList,
      totalPages,
      limit,
    );
  }

  async getRssInfo(rssId: number, viewerId?: number) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssId },
      relations: { user: true },
    });

    if (!rssAccept) {
      throw new NotFoundException('RSS를 찾을 수 없습니다.');
    }

    const [feedCountMap, subscriberCountMap, lastPublishedAt] =
      await Promise.all([
        this.feedRepository.countPublicFeedsByBlogIds([rssId]),
        this.subscriptionRepository.countByBlogIds([rssId]),
        this.feedRepository.getLatestPublicFeedDate(rssId),
      ]);

    let isSubscribed = false;
    let isBlocked = false;
    if (viewerId) {
      const viewerBlogIds =
        await this.subscriptionRepository.getSubscribedBlogIds(viewerId);
      isSubscribed = viewerBlogIds.includes(rssId);
      isBlocked = await this.rssBlockRepository.existsByBlockerAndRss(
        viewerId,
        rssId,
      );
    }

    const isOwner = viewerId != null && rssAccept.userId === viewerId;

    return GetRssInfoResponseDto.toResponseDto(
      rssAccept,
      feedCountMap.get(rssId) ?? 0,
      subscriberCountMap.get(rssId) ?? 0,
      isSubscribed,
      isOwner,
      lastPublishedAt,
      isBlocked,
    );
  }

  private async assertRssAcceptExists(rssId: number) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssId },
      select: { id: true },
    });
    if (!rssAccept) {
      throw new NotFoundException('RSS를 찾을 수 없습니다.');
    }
  }

  async getRssActivities(rssId: number, year: number) {
    await this.assertRssAcceptExists(rssId);

    const rows = await this.feedRepository.findPublishActivityByBlogAndYear(
      rssId,
      year,
    );

    const dailyActivities = rows.map(
      (row) => new DailyActivityDto({ date: row.date, viewCount: row.count }),
    );

    return ReadActivityResponseDto.toResponseDto(dailyActivities);
  }

  async getRssActivityYears(rssId: number) {
    await this.assertRssAcceptExists(rssId);
    return this.feedRepository.findPublishYearsByBlogId(rssId);
  }

  async getRssFeeds(rssId: number, feedDto: GetRssFeedsRequestDto) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssId },
    });

    if (!rssAccept) {
      throw new NotFoundException('RSS를 찾을 수 없습니다.');
    }

    const feeds = await this.feedRepository.getFeedsByBlog(
      rssId,
      feedDto.lastId,
      feedDto.limit,
      true,
      feedDto.date,
    );

    const hasMore = feeds.length > feedDto.limit;
    if (hasMore) feeds.pop();
    const lastId = feeds.length ? feeds[feeds.length - 1].id : 0;

    return GetRssFeedsResponseDto.toResponseDto(feeds, lastId, hasMore);
  }

  async createRssCertification(user: Payload, blogName: string) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { name: blogName },
    });

    if (!rssAccept) {
      throw new NotFoundException('해당 이름의 RSS를 찾을 수 없습니다.');
    }

    if (rssAccept.userId !== null) {
      if (rssAccept.userId === user.id) {
        throw new ConflictException('이미 본인이 인증한 RSS입니다.');
      }
      throw new ConflictException('다른 사용자가 이미 인증한 RSS입니다.');
    }

    if (rssAccept.email === user.email) {
      await this.linkRssAcceptToUser(rssAccept.id, user.id);
      return CreateRssCertificationResponseDto.toResponseDto(rssAccept, true);
    }

    const certificateCode = uuid.v4();
    await this.redisService.set(
      `${REDIS_KEYS.RSS_CERTIFICATION_KEY}:${certificateCode}`,
      JSON.stringify({ rssAcceptId: rssAccept.id, userId: user.id }),
      'EX',
      300,
    );
    await this.emailProducer.produceRssCertification(
      rssAccept.userName,
      rssAccept.name,
      certificateCode,
      rssAccept.email,
      user.email,
    );

    return CreateRssCertificationResponseDto.toResponseDto(rssAccept, false);
  }

  async previewRssCertification(user: Payload, blogName: string) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { name: blogName },
    });

    if (!rssAccept) {
      throw new NotFoundException('해당 이름의 RSS를 찾을 수 없습니다.');
    }

    if (rssAccept.userId !== null) {
      if (rssAccept.userId === user.id) {
        throw new ConflictException('이미 본인이 인증한 RSS입니다.');
      }
      throw new ConflictException('다른 사용자가 이미 인증한 RSS입니다.');
    }

    return PreviewRssCertificationResponseDto.toResponseDto(
      rssAccept,
      rssAccept.email !== user.email,
    );
  }

  async verifyRssCertification(user: Payload, code: string) {
    const redisKey = `${REDIS_KEYS.RSS_CERTIFICATION_KEY}:${code}`;
    const stored = await this.redisService.get(redisKey);

    if (!stored) {
      throw new NotFoundException(
        'RSS 인증 코드가 만료되었거나 찾을 수 없습니다.',
      );
    }

    const { rssAcceptId, userId } = JSON.parse(stored) as {
      rssAcceptId: number;
      userId: number;
    };

    if (userId !== user.id) {
      throw new ForbiddenException('본인의 RSS 인증 요청이 아닙니다.');
    }

    try {
      await this.linkRssAcceptToUser(rssAcceptId, user.id);
    } finally {
      await this.redisService.del(redisKey);
    }
  }

  private async linkRssAcceptToUser(rssAcceptId: number, userId: number) {
    const result = await this.rssAcceptRepository.update(
      { id: rssAcceptId, userId: IsNull() },
      { userId },
    );

    if (result.affected === 0) {
      throw new ConflictException(
        '이미 인증되었거나 인증할 수 없는 RSS입니다.',
      );
    }
  }

  async updateRssCertification(
    user: Payload,
    rssAcceptId: number,
    name: string,
    userName: string,
  ) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssAcceptId },
    });

    if (!rssAccept) {
      throw new NotFoundException('RSS를 찾을 수 없습니다.');
    }

    if (rssAccept.userId !== user.id) {
      throw new ForbiddenException('본인이 인증한 RSS가 아닙니다.');
    }

    if (name !== rssAccept.name) {
      const [duplicateRss, duplicateAccept] = await Promise.all([
        this.rssRepository.findOne({ where: { name } }),
        this.rssAcceptRepository.findOne({ where: { name } }),
      ]);

      if (duplicateRss || duplicateAccept) {
        throw new ConflictException('이미 사용 중인 블로그 이름입니다.');
      }
    }

    await this.rssAcceptRepository.update(
      { id: rssAcceptId },
      { name, userName },
    );
  }

  async deleteRssCertification(user: Payload, rssAcceptId: number) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssAcceptId },
    });

    if (!rssAccept) {
      throw new NotFoundException('RSS를 찾을 수 없습니다.');
    }

    if (rssAccept.userId !== user.id) {
      throw new ForbiddenException('본인이 인증한 RSS가 아닙니다.');
    }

    await this.rssAcceptRepository.update(
      { id: rssAcceptId },
      { userId: null },
    );
  }

  private async assertRssOwnership(rssAcceptId: number, userId: number) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssAcceptId },
    });

    if (!rssAccept) {
      throw new NotFoundException('RSS를 찾을 수 없습니다.');
    }

    if (rssAccept.userId !== userId) {
      throw new ForbiddenException('본인이 인증한 RSS가 아닙니다.');
    }

    return rssAccept;
  }

  async getOwnedRssFeeds(
    user: Payload,
    rssAcceptId: number,
    feedDto: GetOwnedRssFeedsRequestDto,
  ) {
    await this.assertRssOwnership(rssAcceptId, user.id);

    const feeds = await this.feedRepository.getFeedsByBlog(
      rssAcceptId,
      feedDto.lastId,
      feedDto.limit,
      false,
    );

    const hasMore = feeds.length > feedDto.limit;
    if (hasMore) feeds.pop();
    const lastId = feeds.length ? feeds[feeds.length - 1].id : 0;

    return GetOwnedRssFeedsResponseDto.toResponseDto(feeds, lastId, hasMore);
  }

  async setFeedVisibility(
    user: Payload,
    rssAcceptId: number,
    feedId: number,
    isPublic: boolean,
  ) {
    await this.assertRssOwnership(rssAcceptId, user.id);

    const affected = await this.feedRepository.setVisibilityForBlog(
      feedId,
      rssAcceptId,
      isPublic,
    );

    if (!affected) {
      throw new NotFoundException('해당 RSS의 게시글을 찾을 수 없습니다.');
    }
  }
}
