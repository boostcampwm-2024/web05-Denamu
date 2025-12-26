import { validate } from 'class-validator';
import { LoginUserRequestDto } from '../../../src/user/dto/request/loginUser.dto';

describe(`${LoginUserRequestDto.name} Test`, () => {
  let dto: LoginUserRequestDto;

  beforeEach(() => {
    dto = new LoginUserRequestDto({
      email: 'test@test.com',
      password: 'test1234!',
    });
  });

  it('이메일 주소가 유효하고 비밀번호가 문자열일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('이메일 주소가 유효하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'invalid-email';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일 주소가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('password', () => {
    it('비밀번호가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('비밀번호가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('비밀번호가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
