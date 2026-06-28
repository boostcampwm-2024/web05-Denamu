import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ResetPasswordAdminParamRequestDto } from '@admin/dto/request/resetPasswordAdminParam.dto';

describe(`${ResetPasswordAdminParamRequestDto.name} Test`, () => {
  const toDto = (partial: Partial<ResetPasswordAdminParamRequestDto>) =>
    plainToInstance(ResetPasswordAdminParamRequestDto, partial);

  it('UUID v4 형식이면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(
      toDto({ uuid: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9' }),
    );

    // then
    expect(errors).toHaveLength(0);
  });

  it('UUID v4 형식이 아니면 유효성 검사에 실패한다.', async () => {
    // when
    const errors = await validate(toDto({ uuid: 'not-a-uuid' }));

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('인증 코드가 비어 있으면 유효성 검사에 실패한다.', async () => {
    // when
    const errors = await validate(toDto({ uuid: '' }));

    // then
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
