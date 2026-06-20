import { validate } from 'class-validator';

import { ChangePasswordRequestDto } from '@user/dto/request/changePassword.dto';

describe(`${ChangePasswordRequestDto.name} Test`, () => {
  let dto: ChangePasswordRequestDto;

  beforeEach(() => {
    dto = new ChangePasswordRequestDto({
      currentPassword: 'current1234!',
      newPassword: 'newPass1234!',
    });
  });

  it('현재 비밀번호가 문자열이고 새 비밀번호가 정책에 적합하면 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('현재 비밀번호가 생략되어도(소셜 전용 계정) 유효성 검사를 통과한다.', async () => {
    // given
    dto = new ChangePasswordRequestDto({ newPassword: 'newPass1234!' });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('newPassword', () => {
    it('비밀번호 형식에 맞지 않으면 유효성 검사에 실패한다.', async () => {
      // given
      // 8~32자리를 벗어나는 길이
      const outRangedPasswordDto = new ChangePasswordRequestDto({
        newPassword: 'abcd!',
      });

      // 영어/숫자/특수문자를 제외한 문자가 포함되는 경우
      const invalidTextPasswordDto = new ChangePasswordRequestDto({
        newPassword: '한글비밀번호!',
      });

      // 영어/숫자/특수문자를 2종류 미만으로 포함하는 경우
      const lessThanTwoKindsOfLetterPasswordDto = new ChangePasswordRequestDto({
        newPassword: 'testpassword',
      });

      // when
      const outRangedPasswordErrors = await validate(outRangedPasswordDto);
      const invalidTextPasswordErrors = await validate(invalidTextPasswordDto);
      const lessThanTwoKindsOfLetterPasswordErrors = await validate(
        lessThanTwoKindsOfLetterPasswordDto,
      );

      // then
      expect(outRangedPasswordErrors[0].constraints).toHaveProperty('matches');
      expect(invalidTextPasswordErrors[0].constraints).toHaveProperty(
        'matches',
      );
      expect(
        lessThanTwoKindsOfLetterPasswordErrors[0].constraints,
      ).toHaveProperty('matches');
    });

    it('새 비밀번호에 빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.newPassword = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('currentPassword', () => {
    it('현재 비밀번호가 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.currentPassword = 1234 as unknown as string;

      // when
      const errors = await validate(dto);

      // then
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
