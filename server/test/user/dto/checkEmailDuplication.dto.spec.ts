import { validate } from 'class-validator';
import { CheckEmailDuplicationRequestDto } from '../../../src/user/dto/request/checkEmailDuplication.dto';

describe('CheckEmailDuplicationRequestDto Test', () => {
  let dto: CheckEmailDuplicationRequestDto;

  beforeEach(() => {
    dto = new CheckEmailDuplicationRequestDto({
      email: 'test1234@test.com',
    });
  });

  it('email 경로가 올바를 경우 유효성 검사에 성공한다.', async () => {
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

    it('email을 입력하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });
});
