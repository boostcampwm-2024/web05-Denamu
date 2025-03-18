import { UserRepository } from '../repository/user.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from '../dto/request/signup.dto';
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

  async signupUser(signupDto: SignupDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const newUser = signupDto.toEntity();

    const uuid = uuidv4();
    await this.redisService.set(
      `${USER_CONSTANTS.USER_AUTH_KEY}_${newUser.email}_${uuid}`,
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
    if (!user) {
      throw new NotFoundException('계정을 찾을 수 없습니다.');
    }

    const password = user.password;
    const isPasswordSame = await bcrypt.compare(loginDto.password, password);

    if (!isPasswordSame) {
      throw new UnauthorizedException('비밀번호가 다릅니다.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    user.refreshToken = refreshToken;
    await user.save();

    response.cookie('refresh_token', refreshToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return accessToken;
  }
}
