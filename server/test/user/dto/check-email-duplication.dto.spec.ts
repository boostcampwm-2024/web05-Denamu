import { validate } from 'class-validator';

import { CheckEmailDuplicationRequestDto } from '@user/dto/request/checkEmailDuplication.dto';

describe(`${CheckEmailDuplicationRequestDto.name} Test`, () => {
  let dto: CheckEmailDuplicationRequestDto;

  beforeEach(() => {
    dto = new CheckEmailDuplicationRequestDto({
      email: 'test1234@test.com',
    });
  });

  it('이메일 주소가 유효할 경우 유효성 검사에 성공한다.', async () => {
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

    it('이메일 주소가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
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
