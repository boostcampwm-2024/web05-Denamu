import { UserRepository } from '../repository/user.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserRequestDto } from '../dto/request/registerUser.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../common/redis/redis.service';
import { REFRESH_TOKEN_TTL, SALT_ROUNDS } from '../constant/user.constants';
import { EmailService } from '../../common/email/email.service';
import { LoginUserRequestDto } from '../dto/request/loginUser.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { cookieConfig } from '../../common/cookie/cookie.config';
import { Payload } from '../../common/guard/jwt.guard';
import { UpdateUserRequestDto } from '../dto/request/updateUser.dto';
import { FileService } from '../../file/service/file.service';
import { CheckEmailDuplicationResponseDto } from '../dto/response/checkEmailDuplication.dto';
import { REDIS_KEYS } from '../../common/redis/redis.constant';
import { CreateAccessTokenResponseDto } from '../dto/response/createAccessToken.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
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

  async registerUser(registerDto: RegisterUserRequestDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const newUser = registerDto.toEntity();
    newUser.password = await this.createHashedPassword(registerDto.password);

    const uuid = uuidv4();
    await this.redisService.set(
      `${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`,
      JSON.stringify(newUser),
      'EX',
      600,
    );

    this.emailService.sendUserCertificationMail(newUser, uuid);
  }

  async certificateUser(uuid: string): Promise<void> {
    const user = await this.redisService.get(
      `${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`,
    );

    if (!user) {
      throw new NotFoundException('인증에 실패했습니다.');
    }
    await this.redisService.del(`${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`);
    await this.userRepository.save(JSON.parse(user));
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
    const refreshToken = this.createToken(payload, 'refresh');

    response.cookie('refresh_token', refreshToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: REFRESH_TOKEN_TTL,
    });

    return CreateAccessTokenResponseDto.toResponseDto(accessToken);
  }

  refreshAccessToken(userInformation: Payload) {
    const accessToken = this.createToken(userInformation, 'access');
    return CreateAccessTokenResponseDto.toResponseDto(accessToken);
  }

  createToken(userInformation: Payload, mode: string) {
    const payload = {
      id: userInformation.id,
      email: userInformation.email,
      userName: userInformation.userName,
      role: 'user',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get(
        `${mode === 'access' ? 'ACCESS_TOKEN_EXPIRE' : 'REFRESH_TOKEN_EXPIRE'}`,
      ),
      secret: this.configService.get('JWT_ACCESS_SECRET'),
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

    const uuid = uuidv4();
    await this.redisService.set(
      `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`,
      JSON.stringify(user.id),
      'EX',
      600,
    );

    this.emailService.sendPasswordResetEmail(user, uuid);
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
  }

  async requestDeleteAccount(
    userId: number,
    accessToken?: string,
  ): Promise<void> {
    const user = await this.getUser(userId);

    const token = uuidv4();
    await this.redisService.set(
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`,
      user.id.toString(),
      'EX',
      600,
    );

    if (accessToken) {
      await this.redisService.set(
        `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}:access-token`,
        accessToken,
        'EX',
        600,
      );
    }

    this.emailService.sendDeleteAccountMail(user, token);
  }

  async confirmDeleteAccount(token: string): Promise<void> {
    const userIdString = await this.redisService.get(
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`,
    );

    if (!userIdString) {
      throw new NotFoundException('유효하지 않거나 만료된 토큰입니다.');
    }

    const userId = parseInt(userIdString, 10);

    const user = await this.getUser(userId);

    if (user.profileImage) {
      await this.fileService.deleteByPath(user.profileImage);
    }

    const accessToken = await this.redisService.get(
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}:access-token`,
    );

    if (accessToken) {
      const accessTokenExpire = this.configService.get('ACCESS_TOKEN_EXPIRE');
      const ttlInSeconds = this.parseTimeToSeconds(accessTokenExpire);
      await this.addToJwtBlacklist(accessToken, ttlInSeconds);
    }

    await this.userRepository.remove(user);

    await this.redisService.del(
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`,
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}:access-token`,
    );
  }

  private parseTimeToSeconds(time: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = time.match(regex);

    if (!match) {
      const defaultExpire = this.configService.get('ACCESS_TOKEN_EXPIRE');
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

  private async addToJwtBlacklist(
    token: string,
    ttl: number,
  ): Promise<number> {
    const expirationTime = Date.now() + ttl * 1000;
    return this.redisService.hset(
      REDIS_KEYS.USER_BLACKLIST_JWT_KEY,
      token,
      expirationTime.toString(),
    );
  }
}
