import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as uuid from 'uuid';
import axios from 'axios';
import { DataSource, IsNull } from 'typeorm';

import { AdminRepository } from '@admin/repository/admin.repository';

import { EmailProducer } from '@common/email/email.producer';
import { Payload } from '@common/guard/jwt.guard';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { DeleteCertificateRssRequestDto } from '@rss/dto/request/deleteCertificateRss.dto';
import { DeleteRssRequestDto } from '@rss/dto/request/deleteRss.dto';
import { ManageRssRequestDto } from '@rss/dto/request/manageRss.dto';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { RejectRssRequestDto } from '@rss/dto/request/rejectRss';
import { GetOwnedRssFeedsRequestDto } from '@rss/dto/request/getOwnedRssFeeds.dto';
import { CreateRssCertificationResponseDto } from '@rss/dto/response/createRssCertification.dto';
import { GetOwnedRssFeedsResponseDto } from '@rss/dto/response/getOwnedRssFeeds.dto';
import { PreviewRssCertificationResponseDto } from '@rss/dto/response/previewRssCertification.dto';
import { ReadRssResponseDto } from '@rss/dto/response/readRss.dto';
import { ReadRssAcceptHistoryResponseDto } from '@rss/dto/response/readRssAcceptHistory.dto';
import { ReadRssRejectHistoryResponseDto } from '@rss/dto/response/readRssRejectHistory.dto';
import { Rss, RssAccept, RssReject } from '@rss/entity/rss.entity';
import {
  RssAcceptRepository,
  RssRejectRepository,
  RssRepository,
} from '@rss/repository/rss.repository';

import { FeedRepository } from '@feed/repository/feed.repository';

type FullFeedCrawlMessage = {
  rssId: number;
  timestamp: number;
  deathCount: number;
};

@Injectable()
export class RssService {
  constructor(
    private readonly rssRepository: RssRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
    private readonly rssRejectRepository: RssRejectRepository,
    private readonly feedRepository: FeedRepository,
    private readonly emailProducer: EmailProducer,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly adminRepository: AdminRepository,
    private readonly notifierRegistry: NotifierRegistry,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createRss(rssRegisterBodyDto: RegisterRssRequestDto) {
    const { blog, rssUrl } = rssRegisterBodyDto;
    const [duplicateRss, duplicateBlog] = await Promise.all([
      this.rssRepository.findOne({
        where: [{ rssUrl }, { name: blog }],
      }),
      this.rssAcceptRepository.findOne({
        where: [{ rssUrl }, { name: blog }],
      }),
    ]);

    if (duplicateRss || duplicateBlog) {
      const status = duplicateRss ? '신청' : '등록';
      const duplicate = duplicateRss ?? duplicateBlog;
      const field = duplicate.rssUrl === rssUrl ? 'RSS URL' : '블로그 이름';
      throw new ConflictException(`이미 ${status}된 ${field}입니다.`);
    }

    const rssEntity = rssRegisterBodyDto.toEntity();
    await this.rssRepository.insert(rssEntity);

    await this.notifyRssRegistrationRequest(rssEntity);
  }

  private async notifyRssRegistrationRequest(rss: Rss) {
    void this.notifierRegistry.sendAlert(
      `📥 새로운 RSS 등록 신청이 접수되었습니다.\n블로그: ${rss.name}\n신청자: ${rss.userName}\nRSS: ${rss.rssUrl}`,
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
    await this.emailProducer.produceRssRegistration(
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

  private identifyPlatformFromRssUrl(rssUrl: string) {
    type Platform = 'medium' | 'tistory' | 'velog' | 'github' | 'etc';

    const platformRegexp: Record<Platform, RegExp> = {
      medium: /^https:\/\/medium\.com/,
      tistory: /^https:\/\/[a-zA-Z0-9-]+\.tistory\.com/,
      velog: /^https:\/\/v2\.velog\.io/,
      github: /^https:\/\/[\w-]+\.github\.io/,
      etc: /.*/,
    };

    for (const [platform, regex] of Object.entries(platformRegexp)) {
      if (regex.test(rssUrl)) {
        return platform;
      }
    }
    return 'etc';
  }

  private async acceptRssBackProcess(rss: Rss) {
    const blogPlatform = this.identifyPlatformFromRssUrl(rss.rssUrl);

    const rssAccept = await this.dataSource.transaction(async (manager) => {
      const rssAccept = await manager.save(
        RssAccept.fromRss(rss, blogPlatform),
      );
      await manager.delete(Rss, rss.id);
      return rssAccept;
    });

    await this.enqueueFullFeedCrawlMessage(rssAccept.id);
    await this.emailProducer.produceRssRegistration(rssAccept, true);
  }

  private async enqueueFullFeedCrawlMessage(rssId: number) {
    const fullFeedCrawlMessage: FullFeedCrawlMessage = {
      rssId,
      timestamp: Date.now(),
      deathCount: 0,
    };

    await this.redisService.rpush(
      REDIS_KEYS.FULL_FEED_CRAWL_QUEUE,
      JSON.stringify(fullFeedCrawlMessage),
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

    await this.rssAcceptRepository.update({ id: rssAcceptId }, { userId: null });
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
