import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { AdminRepository } from '@admin/repository/admin.repository';

import { CreateUserSuspensionRequestDto } from '@suspension/dto/request/createUserSuspension.dto';
import { GetSuspendedUsersRequestDto } from '@suspension/dto/request/getSuspendedUsers.dto';
import { UpdateUserSuspensionRequestDto } from '@suspension/dto/request/updateUserSuspension.dto';
import { GetSuspendedUsersResponseDto } from '@suspension/dto/response/getSuspendedUsers.dto';
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

    await this.userService.invalidateUserTokens(userId);
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

  async updateUserSuspension(
    adminEmail: string,
    userId: number,
    dto: UpdateUserSuspensionRequestDto,
  ) {
    await this.userService.getUser(userId);

    const suspendedUntil = dto.suspendedUntil
      ? new Date(dto.suspendedUntil)
      : null;

    const admin = await this.adminRepository.findOneBy({ email: adminEmail });

    const affected = await this.userSuspensionRepository.updateActiveSuspension(
      userId,
      {
        suspendedUntil,
        detail: dto.detail,
        adminId: admin?.id ?? null,
      },
    );

    if (!affected) {
      throw new NotFoundException('활성 정지 내역이 없습니다.');
    }

    const isActive =
      suspendedUntil === null || suspendedUntil.getTime() > Date.now();
    if (isActive) {
      await this.userService.invalidateUserTokens(userId);
    }
  }

  async deleteUserSuspension(userId: number) {
    await this.userService.getUser(userId);

    const affected =
      await this.userSuspensionRepository.deleteActiveSuspensions(userId);

    if (!affected) {
      throw new NotFoundException('활성 정지 내역이 없습니다.');
    }
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
