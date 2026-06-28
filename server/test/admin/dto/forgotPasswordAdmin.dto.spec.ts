import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ForgotPasswordAdminRequestDto } from '@admin/dto/request/forgotPasswordAdmin.dto';

describe(`${ForgotPasswordAdminRequestDto.name} Test`, () => {
  const toDto = (partial: Partial<ForgotPasswordAdminRequestDto>) =>
    plainToInstance(ForgotPasswordAdminRequestDto, partial);

  it('올바른 이메일 형식이면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(toDto({ email: 'admin@test.com' }));

    // then
    expect(errors).toHaveLength(0);
  });

  it('이메일 형식이 아니면 유효성 검사에 실패한다.', async () => {
    // when
    const errors = await validate(toDto({ email: 'not-an-email' }));

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('이메일이 비어 있으면 유효성 검사에 실패한다.', async () => {
    // when
    const errors = await validate(toDto({ email: '' }));

    // then
    expect(errors).toHaveLength(1);
  });
});
