import { BadRequestException, Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { AdminRepository } from '@admin/repository/admin.repository';

import { CreateUserSuspensionRequestDto } from '@suspension/dto/request/createUserSuspension.dto';
import { GetSuspendedUsersRequestDto } from '@suspension/dto/request/getSuspendedUsers.dto';
import { GetSuspendedUsersResponseDto } from '@suspension/dto/response/getSuspendedUsers.dto';
import { RssSuspension } from '@suspension/entity/rssSuspension.entity';
import { UserSuspension } from '@suspension/entity/userSuspension.entity';
import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { UserService } from '@user/service/user.service';

interface SuspendParams {
  adminId: number | null;
  detail: string;
  suspendedUntil: Date | null;
}

@Injectable()
export class SuspensionService {
  constructor(
    private readonly userSuspensionRepository: UserSuspensionRepository,
    private readonly userService: UserService,
    private readonly adminRepository: AdminRepository,
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

  async createUserSuspension(
    adminEmail: string,
    dto: CreateUserSuspensionRequestDto,
  ) {
    await this.userService.getUser(dto.userId);

    const suspendedUntil = dto.suspendedUntil
      ? new Date(dto.suspendedUntil)
      : null;
    if (suspendedUntil && suspendedUntil.getTime() <= Date.now()) {
      throw new BadRequestException('정지 종료 일시는 현재 이후여야 합니다.');
    }

    const admin = await this.adminRepository.findOneBy({ email: adminEmail });

    await this.suspendUser(this.userSuspensionRepository.manager, {
      userId: dto.userId,
      adminId: admin?.id ?? null,
      detail: dto.detail,
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
