import { validate } from 'class-validator';
import { LoginUserRequestDto } from '../../../src/user/dto/request/loginUser.dto';

describe('LoginUserRequestDto Test', () => {
  let dto: LoginUserRequestDto;

  beforeEach(() => {
    dto = new LoginUserRequestDto({
      email: 'test@test.com',
      password: 'test1234!',
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
      dto.email = null;

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
      dto.password = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
