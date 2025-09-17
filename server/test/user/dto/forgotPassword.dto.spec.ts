import { validate } from 'class-validator';
import { ForgotPasswordRequestDto } from '../../../src/user/dto/request/forgotPassword.dto';

describe('ForgotPasswordRequestDto Test', () => {
  it('이메일 형식이 아니라면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ForgotPasswordRequestDto('invalidEmail');

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('빈 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ForgotPasswordRequestDto('');

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('아무 값도 없다면(NULL) 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ForgotPasswordRequestDto(null);

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
