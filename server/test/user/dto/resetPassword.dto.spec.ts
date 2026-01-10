import { ResetPasswordRequestDto } from '@user/dto/request/resetPassword.dto';

import { validate } from 'class-validator';

describe(`${ResetPasswordRequestDto.name} Test`, () => {
  let dto: ResetPasswordRequestDto;

  beforeEach(() => {
    dto = new ResetPasswordRequestDto({ uuid: 'test', password: 'test1234!' });
  });

  it('uuid가 문자열이고 비밀번호가 정책에 적합하면 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('uuid', () => {
    it('uuid에 빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('uuid가 null이라면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('password', () => {
    it('비밀번호 형식에 맞지 않으면 유효성 검사에 실패한다.', async () => {
      // given
      // 8~32자리를 벗어나는 길이
      const outRangedPasswordDto = new ResetPasswordRequestDto({
        uuid: 'test-uuid',
        password: 'abcd!',
      });

      // 영어/숫자/특수문자를 제외한 문자가 포함되는 경우
      const invalidTextPasswordDto = new ResetPasswordRequestDto({
        uuid: 'test-uuid',
        password: '한글비밀번호!',
      });

      // 영어/숫자/특수문자를 2종류 미만으로 포함하는 경우
      const lessThanTwoKindsOfLetterPasswordDto = new ResetPasswordRequestDto({
        uuid: 'test-uuid',
        password: 'testpassword',
      });

      // when
      const outRangedPasswordErrors = await validate(outRangedPasswordDto);
      const invalidTextPasswordErrors = await validate(invalidTextPasswordDto);
      const lessThanTwoKindsOfLetterPasswordErrors = await validate(
        lessThanTwoKindsOfLetterPasswordDto,
      );

      // then
      expect(outRangedPasswordErrors).not.toHaveLength(0);
      expect(invalidTextPasswordErrors).not.toHaveLength(0);
      expect(lessThanTwoKindsOfLetterPasswordErrors).not.toHaveLength(0);
      expect(outRangedPasswordErrors[0].constraints).toHaveProperty('matches');
      expect(invalidTextPasswordErrors[0].constraints).toHaveProperty(
        'matches',
      );
      expect(
        lessThanTwoKindsOfLetterPasswordErrors[0].constraints,
      ).toHaveProperty('matches');
    });

    it('비밀번호에 빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('비밀번호가 null이라면 유효성 검사에 실패한다.', async () => {
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
