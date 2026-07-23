import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Payload } from '@common/guard/jwt.guard';

import { ManageBlockRequestDto } from '@block/dto/request/manageBlock.dto';
import { GetBlockedUsersResponseDto } from '@block/dto/response/getBlockedUsers.dto';
import { BlockRepository } from '@block/repository/block.repository';

import { UserService } from '@user/service/user.service';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository: BlockRepository,
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
}
