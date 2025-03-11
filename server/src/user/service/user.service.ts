import { UserRepository } from '../repository/user.repository';
import { Injectable } from '@nestjs/common';
import { SignupDto } from '../dto/request/signup.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async checkEmailDuplication(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return !!user;
  }

  async signupUser(signupDto: SignupDto) {
    const { email, password, userName } = signupDto;

    // UUID 생성

    // 레디스에 사용자 정보 저장
    // 이메일 발송
    // check is user exist
    // check is user confirmed
  }
}
