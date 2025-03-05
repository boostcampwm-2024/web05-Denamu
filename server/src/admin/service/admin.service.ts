import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RegisterAdminRequestDto } from '../dto/request/register-admin.dto';
import { AdminRepository } from '../repository/admin.repository';
import * as bcrypt from 'bcrypt';
import { cookieConfig } from '../../common/cookie/cookie.config';
import * as uuid from 'uuid';
import { RedisService } from '../../common/redis/redis.service';
import { LoginAdminRequestDto } from '../dto/request/login-admin.dto';

@Injectable()
export class AdminService {
  // 12시간 후 자동 만료
  private readonly SESSION_TTL = 60 * 60 * 12;

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

    const sessionId = uuid.v4();

    if (cookie) {
      await this.redisService.del(`auth:${cookie}`);
    }

    let cursor = '0';
    let scanFlag = false;
    do {
      const [newCursor, keys] = await this.redisService.scan(
        cursor,
        'auth:*',
        100,
      );

      cursor = newCursor;

      if (!keys.length) {
        break;
      }

      const values = await this.redisService.mget(...keys);

      for (let i = 0; i < keys.length; i++) {
        const sessionValue = values[i];
        if (sessionValue === loginId) {
          await this.redisService.del(keys[i]);
          scanFlag = true;
          break;
        }
      }
      if (scanFlag) {
        break;
      }
    } while (cursor !== '0');

    await this.redisService.set(
      `auth:${sessionId}`,
      admin.loginId,
      `EX`,
      this.SESSION_TTL,
    );

    response.cookie('sessionId', sessionId, cookieConfig[process.env.NODE_ENV]);
  }

  async logoutAdmin(request: Request, response: Response) {
    const sid = request.cookies['sessionId'];
    await this.redisService.del(`auth:${sid}`);
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
