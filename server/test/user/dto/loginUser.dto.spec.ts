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

  it('email 경로가 올바르고 비밀번호가 정책에 적합할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('잘못된 이메일 형식이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'invalid-email';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
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
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
