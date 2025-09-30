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
    this.redisService.del(`${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`);
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
      JSON.stringify(user),
      'EX',
      600,
    );

    this.emailService.sendPasswordResetEmail(user, uuid);
  }

  async resetPassword(uuid: string, password: string): Promise<void> {
    const userData = await this.redisService.get(
      `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`,
    );

    if (!userData) {
      throw new NotFoundException('인증에 실패했습니다.');
    }

    const user = JSON.parse(userData);
    user.password = await this.createHashedPassword(password);

    this.redisService.del(`${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`);
    await this.userRepository.save(user);
  }
}
