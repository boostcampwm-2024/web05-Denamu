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
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { UpdateAdminProfileRequestDto } from '@admin/dto/request/updateAdminProfile.dto';
import { GetAdminProfileResponseDto } from '@admin/dto/response/getAdminProfile.dto';
import { GetChildAdminResponseDto } from '@admin/dto/response/getChildAdmin.dto';
import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { cookieConfig } from '@common/cookie/cookie.config';
import { EmailProducer } from '@common/email/email.producer';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

const ADMIN_REGISTER_TTL = 600;

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly redisService: RedisService,
    private readonly emailProducer: EmailProducer,
  ) {}

  async loginAdmin(
    loginAdminBodyDto: LoginAdminRequestDto,
    response: Response,
    request: Request,
  ) {
    const cookie = request.cookies['sessionId'];
    const { email, password } = loginAdminBodyDto;

    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('이메일 혹은 비밀번호가 잘못되었습니다.');
    }

    const keysToInvalidate = new Set<string>();
    if (cookie) {
      keysToInvalidate.add(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${cookie}`);
    }

    const prevSessionId = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${email}`,
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
      admin.email,
      `EX`,
      SESSION_TTL,
    );
    await this.redisService.set(
      `${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${email}`,
      sessionId,
      `EX`,
      SESSION_TTL,
    );

    response.cookie('sessionId', sessionId, cookieConfig[process.env.NODE_ENV]);
  }

  async logoutAdmin(request: Request, response: Response) {
    const sid = request.cookies['sessionId'];
    const email = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`,
    );
    await this.redisService.del(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`);
    if (email) {
      await this.redisService.del(
        `${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${email}`,
      );
    }
    response.clearCookie('sessionId');
  }

  async registerAdmin(
    registerAdminBodyDto: RegisterAdminRequestDto,
    creatorEmail: string,
  ) {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: registerAdminBodyDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const existingName = await this.adminRepository.findOne({
      where: { name: registerAdminBodyDto.name },
    });

    if (existingName) {
      throw new ConflictException('이미 존재하는 이름입니다.');
    }

    const creator = await this.adminRepository.findOne({
      where: { email: creatorEmail },
    });

    const saltRounds = 10;
    registerAdminBodyDto.password = await bcrypt.hash(
      registerAdminBodyDto.password,
      saltRounds,
    );

    const admin = registerAdminBodyDto.toEntity();
    admin.parentAdminId = creator?.id ?? null;

    const adminRegisterCode = uuid.v4();
    await this.redisService.set(
      `${REDIS_KEYS.ADMIN_REGISTER_KEY}:${adminRegisterCode}`,
      JSON.stringify(admin),
      'EX',
      ADMIN_REGISTER_TTL,
    );
    await this.emailProducer.produceAdminCertification(
      admin.email,
      admin.name,
      adminRegisterCode,
    );
  }

  async certificateAdmin(uuid: string) {
    const admin = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_REGISTER_KEY}:${uuid}`,
    );

    if (!admin) {
      throw new NotFoundException('인증에 실패했습니다.');
    }
    await this.redisService.del(`${REDIS_KEYS.ADMIN_REGISTER_KEY}:${uuid}`);

    try {
      await this.adminRepository.save(JSON.parse(admin));
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 존재하는 이메일 또는 이름입니다.');
      }
      throw error;
    }
  }

  async getChildAdmins(email: string) {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    const children = await this.adminRepository.find({
      where: { parentAdminId: admin.id },
    });

    return children.map((child) =>
      GetChildAdminResponseDto.toResponseDto(child),
    );
  }

  async deleteChildAdmin(email: string, targetAdminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { email },
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

    const emailsToInvalidate = await this.collectSubtreeEmails(target);

    await this.adminRepository.delete({ id: target.id });

    await Promise.all(
      emailsToInvalidate.map((targetEmail) =>
        this.redisService.setex(
          `${REDIS_KEYS.ADMIN_INVALIDATED_PREFIX}:${targetEmail}`,
          SESSION_TTL,
          '1',
        ),
      ),
    );
  }

  async requestDeleteAccount(email: string) {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (!admin) {
      throw new NotFoundException('존재하지 않는 관리자 계정입니다.');
    }

    const deleteCode = uuid.v4();

    await this.redisService.set(
      `${REDIS_KEYS.ADMIN_DELETE_ACCOUNT_KEY}:${deleteCode}`,
      admin.id.toString(),
      'EX',
      ADMIN_REGISTER_TTL,
    );
    await this.emailProducer.produceAdminAccountDeletion(
      admin.email,
      admin.name,
      deleteCode,
    );
  }

  async confirmDeleteAccount(token: string) {
    const deleteRequestKey = `${REDIS_KEYS.ADMIN_DELETE_ACCOUNT_KEY}:${token}`;

    const data = await this.redisService.get(deleteRequestKey);

    if (!data) {
      throw new NotFoundException('유효하지 않거나 만료된 토큰입니다.');
    }

    const adminId = parseInt(data, 10);
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      await this.redisService.del(deleteRequestKey);
      throw new NotFoundException('존재하지 않는 관리자 계정입니다.');
    }

    const emailsToInvalidate = await this.collectSubtreeEmails(admin);

    await this.adminRepository.delete({ id: admin.id });
    await this.redisService.del(deleteRequestKey);

    await Promise.all(
      emailsToInvalidate.map((targetEmail) =>
        this.redisService.setex(
          `${REDIS_KEYS.ADMIN_INVALIDATED_PREFIX}:${targetEmail}`,
          SESSION_TTL,
          '1',
        ),
      ),
    );
  }

  async forgotPassword(email: string) {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    // 계정 열거(enumeration) 방지를 위해 미존재 시에도 동일 응답을 반환한다.
    if (!admin) {
      return;
    }

    const resetCode = uuid.v4();
    await this.redisService.set(
      `${REDIS_KEYS.ADMIN_RESET_PASSWORD_KEY}:${resetCode}`,
      admin.id.toString(),
      'EX',
      ADMIN_REGISTER_TTL,
    );
    await this.emailProducer.produceAdminPasswordReset(
      admin.email,
      admin.name,
      resetCode,
    );
  }

  async resetPassword(token: string, password: string) {
    const resetRequestKey = `${REDIS_KEYS.ADMIN_RESET_PASSWORD_KEY}:${token}`;

    const data = await this.redisService.get(resetRequestKey);

    if (!data) {
      throw new NotFoundException('인증에 실패했습니다.');
    }

    const adminId = parseInt(data, 10);
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      await this.redisService.del(resetRequestKey);
      throw new NotFoundException('인증에 실패했습니다.');
    }

    const saltRounds = 10;
    admin.password = await bcrypt.hash(password, saltRounds);
    await this.adminRepository.save(admin);

    await this.redisService.del(resetRequestKey);
    await this.invalidateAdminSession(admin.email);
  }

  private async invalidateAdminSession(email: string) {
    const prevSessionId = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${email}`,
    );
    const keysToDelete = [`${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${email}`];
    if (prevSessionId) {
      keysToDelete.push(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${prevSessionId}`);
    }
    await this.redisService.del(...keysToDelete);
  }

  private async collectSubtreeEmails(root: Admin): Promise<string[]> {
    const emails = [root.email];
    let frontier = [root.id];

    while (frontier.length > 0) {
      const children = await this.adminRepository.find({
        where: { parentAdminId: In(frontier) },
      });
      if (children.length === 0) {
        break;
      }
      emails.push(...children.map((child) => child.email));
      frontier = children.map((child) => child.id);
    }

    return emails;
  }

  async getAdminProfile(email: string) {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    let parent = null;
    if (admin.parentAdminId) {
      const parentAdmin = await this.adminRepository.findOne({
        where: { id: admin.parentAdminId },
      });
      if (parentAdmin) {
        parent = { email: parentAdmin.email, name: parentAdmin.name };
      }
    }

    return GetAdminProfileResponseDto.toResponseDto(
      admin.email,
      admin.name,
      admin.emailNotification,
      parent,
    );
  }

  async updateAdminProfile(
    email: string,
    updateAdminProfileDto: UpdateAdminProfileRequestDto,
  ) {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (!admin) {
      throw new NotFoundException('존재하지 않는 관리자 계정입니다.');
    }

    const { name, password, emailNotification } = updateAdminProfileDto;

    if (name !== undefined && name !== admin.name) {
      const existingName = await this.adminRepository.findOne({
        where: { name },
      });
      if (existingName) {
        throw new ConflictException('이미 존재하는 이름입니다.');
      }
      admin.name = name;
    }

    const passwordChanged = password !== undefined;
    if (passwordChanged) {
      const saltRounds = 10;
      admin.password = await bcrypt.hash(password, saltRounds);
    }

    if (emailNotification !== undefined) {
      admin.emailNotification = emailNotification;
    }

    try {
      await this.adminRepository.save(admin);
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 존재하는 이름입니다.');
      }
      throw error;
    }

    if (passwordChanged) {
      await this.invalidateAdminSession(admin.email);
    }
  }
}
