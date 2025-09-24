import { validate } from 'class-validator';
import { CheckEmailDuplicationRequestDto } from '../../../src/user/dto/request/checkEmailDuplication.dto';

describe('CheckEmailDuplicationRequestDto Test', () => {
  let dto: CheckEmailDuplicationRequestDto;

  beforeEach(() => {
    dto = new CheckEmailDuplicationRequestDto({
      email: 'test1234@test.com',
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

    it('빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
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
