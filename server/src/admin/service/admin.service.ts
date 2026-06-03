import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { Request, Response } from 'express';

import { SESSION_TTL } from '@admin/constant/admin.constant';
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
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

  async createAdmin(registerAdminBodyDto: RegisterAdminRequestDto) {
    const existingAdmin = await this.adminRepository.findOne({
      where: { loginId: registerAdminBodyDto.loginId },
    });

    if (existingAdmin) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    const saltRounds = 10;
    registerAdminBodyDto.password = await bcrypt.hash(
      registerAdminBodyDto.password,
      saltRounds,
    );

    await this.adminRepository.save(registerAdminBodyDto.toEntity());
  }
}
