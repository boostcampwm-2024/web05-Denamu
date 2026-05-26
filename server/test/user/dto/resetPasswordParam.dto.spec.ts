import { validate } from 'class-validator';

import { ResetPasswordParamRequestDto } from '@user/dto/request/resetPasswordParam.dto';

describe(`${ResetPasswordParamRequestDto.name} Test`, () => {
  let dto: ResetPasswordParamRequestDto;

  beforeEach(() => {
    dto = new ResetPasswordParamRequestDto({
      uuid: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    });
  });

  it('유효한 UUID v4이면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('uuid', () => {
    it('uuid가 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('uuid가 UUID v4 형식이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = 'not-a-uuid';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('uuid가 UUID v4가 아닌 다른 버전(v1)이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // UUID v1

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });
});
