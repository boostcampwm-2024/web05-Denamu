import { validate } from 'class-validator';
import { PasswordResetRequestDto } from '../../../src/user/dto/request/resetPassword.dto';

describe('PasswordResetRequestDto Test', () => {
  it('uuid에 빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new PasswordResetRequestDto('', 'test1234!');

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('uuid에 아무 값도 없다면(NULL) 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new PasswordResetRequestDto(null, 'test1234!');

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('비밀번호 형식에 맞지 않으면 유효성 검사에 실패한다.', async () => {
    // given
    // 8~32자리를 벗어나는 길이
    const outRangedPasswordDto = new PasswordResetRequestDto(
      'test-uuid',
      'abcd!',
    );

    // 영어/숫자/특수문자를 제외한 문자가 포함되는 경우
    const invalidTextPasswordDto = new PasswordResetRequestDto(
      'test-uuid',
      '한글테스트',
    );

    // 영어/숫자/특수문자를 2종류 미만으로 포함하는 경우
    const lessThanTwoKindsOfLetterPasswordDto = new PasswordResetRequestDto(
      'test-uuid',
      'testpassword',
    );

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
    expect(invalidTextPasswordErrors[0].constraints).toHaveProperty('matches');
    expect(
      lessThanTwoKindsOfLetterPasswordErrors[0].constraints,
    ).toHaveProperty('matches');
  });

  it('비밀번호에 빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new PasswordResetRequestDto('test-uuid', '');

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('비밀번호에 아무 값도 없다면(NULL) 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new PasswordResetRequestDto('test-uuid', null);

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
