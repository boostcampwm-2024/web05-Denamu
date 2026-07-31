import { validate } from 'class-validator';

import { OAuthType } from '@user/constant/oauth.constant';
import { OAuthUnlinkParamRequestDto } from '@user/dto/request/oAuthUnlinkParam.dto';

describe(`${OAuthUnlinkParamRequestDto.name} Test`, () => {
  let dto: OAuthUnlinkParamRequestDto;

  beforeEach(() => {
    dto = new OAuthUnlinkParamRequestDto({
      provider: OAuthType.Google,
    });
  });

  it('연결 해제할 제공자가 타입 목록에 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('provider', () => {
    it('제공자가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.provider = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('제공자가 타입 목록에 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.provider = 'naver' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
