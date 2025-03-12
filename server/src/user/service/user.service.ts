import { UserRepository } from '../repository/user.repository';
import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from '../dto/request/signup.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../common/redis/redis.service';
import { USER_CONSTANTS } from '../user.constants';
import { EmailService } from '../../common/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
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
    );

    this.emailService.sendUserCertificationMail(newUser, uuid);
  }
}
