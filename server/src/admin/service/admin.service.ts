import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { Request, Response } from 'express';
import { In } from 'typeorm';

import { SESSION_TTL } from '@admin/constant/admin.constant';
import { Admin } from '@admin/entity/admin.entity';
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { GetChildAdminResponseDto } from '@admin/dto/response/getChildAdmin.dto';
import { GetAdminProfileResponseDto } from '@admin/dto/response/getAdminProfile.dto';
import { AdminRepository } from '@admin/repository/admin.repository';

import { cookieConfig } from '@common/cookie/cookie.config';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly redisService: RedisService,
  ) {}

  async loginAdmin(
    loginAdminBodyDto: LoginAdminRequestDto,
    response: Response,
    request: Request,
  ) {
    const cookie = request.cookies['sessionId'];
    const { loginId, password } = loginAdminBodyDto;

    const admin = await this.adminRepository.findOne({
      where: { loginId },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('아이디 혹은 비밀번호가 잘못되었습니다.');
    }

    const keysToInvalidate = new Set<string>();
    if (cookie) {
      keysToInvalidate.add(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${cookie}`);
    }

    const prevSessionId = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_SESSION_BY_LOGIN}:${loginId}`,
    );
    if (prevSessionId) {
      keysToInvalidate.add(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${prevSessionId}`);
    }

    if (keysToInvalidate.size > 0) {
      await this.redisService.del(...keysToInvalidate);
    }

    const sessionId = uuid.v4();

    await this.redisService.set(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:${sessionId}`,
      admin.loginId,
      `EX`,
      SESSION_TTL,
    );
    await this.redisService.set(
      `${REDIS_KEYS.ADMIN_SESSION_BY_LOGIN}:${loginId}`,
      sessionId,
      `EX`,
      SESSION_TTL,
    );

    response.cookie('sessionId', sessionId, cookieConfig[process.env.NODE_ENV]);
  }

  async logoutAdmin(request: Request, response: Response) {
    const sid = request.cookies['sessionId'];
    const loginId = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`,
    );
    await this.redisService.del(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`);
    if (loginId) {
      await this.redisService.del(
        `${REDIS_KEYS.ADMIN_SESSION_BY_LOGIN}:${loginId}`,
      );
    }
    response.clearCookie('sessionId');
  }

  async createAdmin(
    registerAdminBodyDto: RegisterAdminRequestDto,
    creatorLoginId: string,
  ) {
    const existingAdmin = await this.adminRepository.findOne({
      where: { loginId: registerAdminBodyDto.loginId },
    });

    if (existingAdmin) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    const creator = await this.adminRepository.findOne({
      where: { loginId: creatorLoginId },
    });

    const saltRounds = 10;
    registerAdminBodyDto.password = await bcrypt.hash(
      registerAdminBodyDto.password,
      saltRounds,
    );

    const admin = registerAdminBodyDto.toEntity();
    admin.parentAdminId = creator?.id ?? null;

    await this.adminRepository.save(admin);
  }

  async getChildAdmins(loginId: string) {
    const admin = await this.adminRepository.findOne({
      where: { loginId },
    });

    const children = await this.adminRepository.find({
      where: { parentAdminId: admin.id },
    });

    return children.map((child) =>
      GetChildAdminResponseDto.toResponseDto(child),
    );
  }

  async deleteChildAdmin(loginId: string, targetAdminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { loginId },
    });

    const target = await this.adminRepository.findOne({
      where: { id: targetAdminId },
    });

    if (!target) {
      throw new NotFoundException('존재하지 않는 관리자 계정입니다.');
    }

    if (target.parentAdminId !== admin.id) {
      throw new ForbiddenException(
        '본인이 생성한 관리자 계정만 삭제할 수 있습니다.',
      );
    }

    const loginIdsToInvalidate = await this.collectSubtreeLoginIds(target);

    await this.adminRepository.delete({ id: target.id });

    await Promise.all(
      loginIdsToInvalidate.map((id) =>
        this.redisService.setex(
          `${REDIS_KEYS.ADMIN_INVALIDATED_PREFIX}:${id}`,
          SESSION_TTL,
          '1',
        ),
      ),
    );
  }

  private async collectSubtreeLoginIds(root: Admin): Promise<string[]> {
    const loginIds = [root.loginId];
    let frontier = [root.id];

    while (frontier.length > 0) {
      const children = await this.adminRepository.find({
        where: { parentAdminId: In(frontier) },
      });
      if (children.length === 0) {
        break;
      }
      loginIds.push(...children.map((child) => child.loginId));
      frontier = children.map((child) => child.id);
    }

    return loginIds;
  }

  async getAdminProfile(loginId: string) {
    const admin = await this.adminRepository.findOne({
      where: { loginId },
    });

    let parent = null;
    if (admin.parentAdminId) {
      const parentAdmin = await this.adminRepository.findOne({
        where: { id: admin.parentAdminId },
      });
      if (parentAdmin) {
        parent = { loginId: parentAdmin.loginId, name: parentAdmin.name };
      }
    }

    return GetAdminProfileResponseDto.toResponseDto(admin.name, parent);
  }
}
