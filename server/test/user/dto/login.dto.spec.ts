import { validate } from 'class-validator';
import { LoginDto } from '../../../src/user/dto/request/login.dto';

describe('LoginDto Test', () => {
  it('잘못된 이메일 형식이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new LoginDto({
      email: 'invalid-email',
      password: 'test1234!',
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('이메일이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new LoginDto({
      email: '',
      password: 'test1234!',
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('비밀번호가 빈 문자열이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new LoginDto({
      email: 'test123@test.com',
      password: '',
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
