import { UserRepository } from '../repository/user.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '../dto/request/register.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../common/redis/redis.service';
import { USER_CONSTANTS } from '../user.constants';
import { EmailService } from '../../common/email/email.service';
import { LoginDto } from '../dto/request/login.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { cookieConfig } from '../../common/cookie/cookie.config';
import { Payload } from '../../common/guard/jwt.guard';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async checkEmailDuplication(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return !!user;
  }

  async registerUser(registerDto: RegisterDto): Promise<void> {
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
      `${USER_CONSTANTS.USER_AUTH_KEY}_${uuid}`,
      JSON.stringify(newUser),
      'EX',
      600,
    );

    this.emailService.sendUserCertificationMail(newUser, uuid);
  }

  async certificateUser(uuid: string): Promise<void> {
    const user = await this.redisService.get(
      `${USER_CONSTANTS.USER_AUTH_KEY}_${uuid}`,
    );

    if (!user) {
      throw new NotFoundException('인증에 실패했습니다.');
    }

    await this.userRepository.save(JSON.parse(user));
  }

  async loginUser(loginDto: LoginDto, response: Response) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('아이디 혹은 비밀번호가 잘못되었습니다.');
    }

    const payload = {
      id: String(user.id),
      email: user.email,
      userName: user.userName,
      role: 'user',
    };

    const accessToken = this.createAccessToken(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRE'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    response.cookie('refresh_token', refreshToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return accessToken;
  }

  createAccessToken(userInformation: Payload) {
    const payload = {
      id: userInformation.id,
      email: userInformation.email,
      userName: userInformation.userName,
      role: 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE'),
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });

    return accessToken;
  }

  async logoutUser(userInformation: Payload) {
    const user = await this.userRepository.findOne({
      where: {
        id: parseInt(userInformation.id),
        email: userInformation.email,
        userName: userInformation.userName,
      },
    });
    user.refreshToken = null;
    await user.save();
  }

  private async createHashedPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
