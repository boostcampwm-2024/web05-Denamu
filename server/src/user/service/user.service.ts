import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { Response } from 'express';

import { cookieConfig } from '@common/cookie/cookie.config';
import { EmailProducer } from '@common/email/email.producer';
import { Payload } from '@common/guard/jwt.guard';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FileService } from '@file/service/file.service';

import { REFRESH_TOKEN_TTL, SALT_ROUNDS } from '@user/constant/user.constants';
import { LoginUserRequestDto } from '@user/dto/request/loginUser.dto';
import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import { UpdateUserRequestDto } from '@user/dto/request/updateUser.dto';
import { CheckEmailDuplicationResponseDto } from '@user/dto/response/checkEmailDuplication.dto';
import { CreateAccessTokenResponseDto } from '@user/dto/response/createAccessToken.dto';
import { UserRepository } from '@user/repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly emailProducer: EmailProducer,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
  ) {}

  async getUser(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  async checkEmailDuplication(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return CheckEmailDuplicationResponseDto.toResponseDto(!!user);
  }

  async checkNameDuplication(userName: string) {
    const user = await this.userRepository.findOne({
      where: { userName },
    });

    return CheckEmailDuplicationResponseDto.toResponseDto(!!user);
  }

  async registerUser(registerDto: RegisterUserRequestDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const existingName = await this.userRepository.findOne({
      where: { userName: registerDto.userName },
    });

    if (existingName) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }

    const newUser = registerDto.toEntity();
    newUser.password = await this.createHashedPassword(registerDto.password);

    const userRegisterCode = uuid.v4();
    await this.redisService.set(
      `${REDIS_KEYS.USER_AUTH_KEY}:${userRegisterCode}`,
      JSON.stringify(newUser),
      'EX',
      600,
    );
    await this.emailProducer.produceUserCertification(
      newUser,
      userRegisterCode,
    );
  }

  async certificateUser(uuid: string): Promise<void> {
    const user = await this.redisService.get(
      `${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`,
    );

    if (!user) {
      throw new NotFoundException('인증에 실패했습니다.');
    }
    await this.redisService.del(`${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`);

    try {
      await this.userRepository.save(JSON.parse(user));
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 존재하는 이메일 또는 닉네임입니다.');
      }
      throw error;
    }
  }

  async loginUser(loginDto: LoginUserRequestDto, response: Response) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('아이디 혹은 비밀번호가 잘못되었습니다.');
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: 'user',
    };

    const accessToken = this.createToken(payload, 'access');
    this.issueRefreshToken(payload, response);

    return CreateAccessTokenResponseDto.toResponseDto(accessToken);
  }

  refreshAccessToken(userInformation: Payload, response: Response) {
    this.issueRefreshToken(userInformation, response);
    const accessToken = this.createToken(userInformation, 'access');
    return CreateAccessTokenResponseDto.toResponseDto(accessToken);
  }

  issueRefreshToken(userInformation: Payload, response: Response) {
    const refreshToken = this.createToken(userInformation, 'refresh');
    response.cookie('refresh_token', refreshToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: REFRESH_TOKEN_TTL,
    });
  }

  createToken(userInformation: Payload, mode: 'refresh' | 'access') {
    const payload = {
      id: userInformation.id,
      email: userInformation.email,
      userName: userInformation.userName,
      role: 'user',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get(
        `${mode === 'access' ? 'JWT_ACCESS_TOKEN_EXPIRE' : 'JWT_REFRESH_TOKEN_EXPIRE'}`,
      ),
      secret: this.configService.get(
        mode === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET',
      ),
    });
  }

  private async createHashedPassword(password: string) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  async updateUserActivity(userId: number) {
    const user = await this.getUser(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    user.totalViews += 1;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const timeDiff = today.getTime() - lastActive.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        user.currentStreak += 1;
      } else if (daysDiff > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }

    if (user.currentStreak > user.maxStreak) {
      user.maxStreak = user.currentStreak;
    }
    user.lastActiveDate = today;

    await this.userRepository.save(user);
  }

  async updateUser(
    userId: number,
    updateData: Partial<UpdateUserRequestDto>,
  ): Promise<void> {
    const user = await this.getUser(userId);

    if (updateData.userName !== undefined) {
      user.userName = updateData.userName;
    }
    if (
      updateData.profileImage !== undefined &&
      user.profileImage !== updateData.profileImage
    ) {
      await this.fileService.deleteByPath(user.profileImage);
      user.profileImage = updateData.profileImage;
    }
    if (updateData.introduction !== undefined) {
      user.introduction = updateData.introduction;
    }

    await this.userRepository.save(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      return;
    }

    const forgotPasswordCode = uuid.v4();
    await this.redisService.set(
      `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${forgotPasswordCode}`,
      JSON.stringify(user.id),
      'EX',
      600,
    );
    await this.emailProducer.producePasswordReset(user, forgotPasswordCode);
  }

  async resetPassword(uuid: string, password: string): Promise<void> {
    const userId = Number(
      await this.redisService.get(
        `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`,
      ),
    );

    if (isNaN(userId) || userId === 0) {
      throw new NotFoundException('인증에 실패했습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    user.password = await this.createHashedPassword(password);

    await this.redisService.del(
      `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`,
    );
    await this.userRepository.save(user);
    await this.invalidateUserTokens(user.id);
  }

  private async invalidateUserTokens(userId: number) {
    const ttlInSeconds = this.parseTimeToSeconds(
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRE'),
    );
    await this.redisService.setex(
      `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:${userId}`,
      ttlInSeconds,
      Math.floor(Date.now() / 1000).toString(),
    );
  }

  async requestDeleteAccount(userId: number): Promise<void> {
    const user = await this.getUser(userId);

    const userDeleteCode = uuid.v4();

    await this.redisService.set(
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${userDeleteCode}`,
      user.id.toString(),
      'EX',
      600,
    );
    await this.emailProducer.produceAccountDeletion(user, userDeleteCode);
  }

  async confirmDeleteAccount(token: string): Promise<void> {
    const deleteRequestKey = `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`;

    const data = await this.redisService.get(deleteRequestKey);

    if (!data) {
      throw new NotFoundException('유효하지 않거나 만료된 토큰입니다.');
    }

    const userId = parseInt(data, 10);
    const user = await this.getUser(userId);

    if (user.profileImage) {
      await this.fileService.deleteByPath(user.profileImage);
    }

    await Promise.all([
      this.invalidateUserTokens(userId),
      this.userRepository.remove(user),
      this.redisService.del(deleteRequestKey),
    ]);
  }

  private parseTimeToSeconds(time: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = time.match(regex);

    if (!match) {
      const defaultExpire = this.configService.get('JWT_ACCESS_TOKEN_EXPIRE');
      if (defaultExpire && defaultExpire !== time) {
        return this.parseTimeToSeconds(defaultExpire);
      }
      return 3600;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * multipliers[unit];
  }
}
