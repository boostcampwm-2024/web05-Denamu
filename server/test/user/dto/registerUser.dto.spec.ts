import { validate } from 'class-validator';
import { RegisterUserRequestDto } from '../../../src/user/dto/request/registerUser.dto';

describe('RegisterDto Test', () => {
  let dto: RegisterUserRequestDto;

  beforeEach(() => {
    dto = new RegisterUserRequestDto({
      email: 'test@test.com',
      password: 'test1234!',
      userName: 'test',
    });
  });

  describe('email', () => {
    it('잘못된 이메일 형식이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'invalid-email';
      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('password', () => {
    it('비밀번호가 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('userName', () => {
    it('사용자 이름이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
