import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { OAuthType } from '@user/constant/oauth.constant';
import { OAuthE2eCallbackQueryRequestDto } from '@user/dto/request/oAuthE2eCallbackQuery.dto';

describe(`${OAuthE2eCallbackQueryRequestDto.name} Test`, () => {
  const toDto = (partial: Partial<OAuthE2eCallbackQueryRequestDto>) =>
    plainToInstance(OAuthE2eCallbackQueryRequestDto, partial);

  it('제공자가 타입 목록에 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(toDto({ provider: OAuthType.Github }));

    // then
    expect(errors).toHaveLength(0);
  });

  it('제공자가 없을 경우 기본값 Google이 적용되어 유효성 검사에 성공한다.', async () => {
    // given
    const dto = toDto({});

    // when
    const errors = await validate(dto);

    // then
    expect(dto.provider).toBe(OAuthType.Google);
    expect(errors).toHaveLength(0);
  });

  describe('provider', () => {
    it('제공자가 타입 목록에 없을 경우 유효성 검사에 실패한다.', async () => {
      // when
      const errors = await validate(toDto({ provider: 'naver' as any }));

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
