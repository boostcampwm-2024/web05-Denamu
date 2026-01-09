import { validate } from 'class-validator';
import { ForgotPasswordRequestDto } from '@src/user/dto/request/forgotPassword.dto';

describe(`${ForgotPasswordRequestDto.name} Test`, () => {
  let dto: ForgotPasswordRequestDto;

  beforeEach(() => {
    dto = new ForgotPasswordRequestDto({ email: 'test1234@test.com' });
  });

  it('email 경로가 올바를 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('이메일 형식이 아니라면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'invalid-email';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('이메일을 입력하지 않는다면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
