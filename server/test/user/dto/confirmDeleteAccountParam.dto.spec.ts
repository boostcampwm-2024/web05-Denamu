import { validate } from 'class-validator';

import { ConfirmDeleteAccountParamRequestDto } from '@user/dto/request/confirmDeleteAccountParam.dto';

describe(`${ConfirmDeleteAccountParamRequestDto.name} Test`, () => {
  let dto: ConfirmDeleteAccountParamRequestDto;

  beforeEach(() => {
    dto = new ConfirmDeleteAccountParamRequestDto({
      token: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    });
  });

  it('유효한 UUID v4 토큰이면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('token', () => {
    it('토큰이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.token = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('토큰이 UUID v4 형식이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.token = 'not-a-uuid';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('토큰이 UUID v4가 아닌 다른 버전(v1)이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.token = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // UUID v1

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });
});
