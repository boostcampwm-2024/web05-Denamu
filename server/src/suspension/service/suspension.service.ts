import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { GetSuspendedUsersRequestDto } from '@suspension/dto/request/getSuspendedUsers.dto';
import { GetSuspendedUsersResponseDto } from '@suspension/dto/response/getSuspendedUsers.dto';
import { RssSuspension } from '@suspension/entity/rssSuspension.entity';
import { UserSuspension } from '@suspension/entity/userSuspension.entity';
import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

interface SuspendParams {
  adminId: number | null;
  detail: string;
  suspendedUntil: Date | null;
}

@Injectable()
export class SuspensionService {
  constructor(
    private readonly userSuspensionRepository: UserSuspensionRepository,
  ) {}

  async suspendUser(
    manager: EntityManager,
    {
      userId,
      adminId,
      detail,
      suspendedUntil,
    }: SuspendParams & { userId: number },
  ) {
    await manager.save(UserSuspension, {
      user: { id: userId },
      admin: adminId ? { id: adminId } : null,
      detail,
      suspendedUntil,
    });
  }

  async suspendRss(
    manager: EntityManager,
    {
      rssId,
      adminId,
      detail,
      suspendedUntil,
    }: SuspendParams & { rssId: number },
  ) {
    await manager.save(RssSuspension, {
      rss: { id: rssId },
      admin: adminId ? { id: adminId } : null,
      detail,
      suspendedUntil,
    });
  }

  async getSuspendedUsers(queryDto: GetSuspendedUsersRequestDto) {
    const limit = queryDto.limit ?? 10;
    const suspensions =
      await this.userSuspensionRepository.findActiveSuspendedUsers(
        queryDto.lastId,
        limit,
      );

    const hasMore = suspensions.length > limit;
    if (hasMore) suspensions.pop();
    const lastId = suspensions.length
      ? suspensions[suspensions.length - 1].id
      : 0;

    return GetSuspendedUsersResponseDto.toResponseDto(
      suspensions,
      lastId,
      hasMore,
    );
  }
}
