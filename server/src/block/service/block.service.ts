import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Payload } from '@common/guard/jwt.guard';

import { ManageBlockRequestDto } from '@block/dto/request/manageBlock.dto';
import { ManageRssBlockRequestDto } from '@block/dto/request/manageRssBlock.dto';
import { GetBlockedRssResponseDto } from '@block/dto/response/getBlockedRss.dto';
import { GetBlockedUsersResponseDto } from '@block/dto/response/getBlockedUsers.dto';
import { BlockRepository } from '@block/repository/block.repository';
import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserService } from '@user/service/user.service';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository: BlockRepository,
    private readonly rssBlockRepository: RssBlockRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
    private readonly userService: UserService,
  ) {}

  async create(userInformation: Payload, blockDto: ManageBlockRequestDto) {
    if (userInformation.id === blockDto.userId) {
      throw new BadRequestException('자기 자신을 차단할 수 없습니다.');
    }
    await this.userService.getUser(blockDto.userId);

    try {
      await this.blockRepository.insert({
        blocker: { id: userInformation.id },
        blocked: { id: blockDto.userId },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 차단한 사용자입니다.');
      }
      throw error;
    }
  }

  async delete(userInformation: Payload, blockDto: ManageBlockRequestDto) {
    const result = await this.blockRepository.delete({
      blocker: { id: userInformation.id },
      blocked: { id: blockDto.userId },
    });

    if (!result.affected) {
      throw new NotFoundException('차단하지 않은 사용자입니다.');
    }
  }

  async getBlockedUsers(userInformation: Payload) {
    const blocks = await this.blockRepository.getBlockedUsers(
      userInformation.id,
    );
    return GetBlockedUsersResponseDto.toResponseDtoArray(blocks);
  }

  async createRssBlock(
    userInformation: Payload,
    rssBlockDto: ManageRssBlockRequestDto,
  ) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: rssBlockDto.rssId },
      select: { id: true },
    });
    if (!rssAccept) {
      throw new NotFoundException('존재하지 않는 RSS입니다.');
    }

    try {
      await this.rssBlockRepository.insert({
        blocker: { id: userInformation.id },
        blockedRss: { id: rssBlockDto.rssId },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 차단한 RSS입니다.');
      }
      throw error;
    }
  }

  async deleteRssBlock(
    userInformation: Payload,
    rssBlockDto: ManageRssBlockRequestDto,
  ) {
    const result = await this.rssBlockRepository.delete({
      blocker: { id: userInformation.id },
      blockedRss: { id: rssBlockDto.rssId },
    });

    if (!result.affected) {
      throw new NotFoundException('차단하지 않은 RSS입니다.');
    }
  }

  async getBlockedRssList(userInformation: Payload) {
    const rssBlocks = await this.rssBlockRepository.getBlockedRssList(
      userInformation.id,
    );
    return GetBlockedRssResponseDto.toResponseDtoArray(rssBlocks);
  }
}
