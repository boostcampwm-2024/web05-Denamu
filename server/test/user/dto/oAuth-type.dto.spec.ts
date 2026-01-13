import { validate } from 'class-validator';
import { OAuthTypeRequestDto } from '@user/dto/request/oAuthType.dto';
import { OAuthType } from '@user/constant/oauth.constant';

describe(`${OAuthTypeRequestDto.name} Test`, () => {
  let dto: OAuthTypeRequestDto;

  beforeEach(() => {
    dto = new OAuthTypeRequestDto({
      type: OAuthType.Google,
    });
  });

  it('OAuth 타입이 서비스에서 제공하는 타입에 포함될 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('type', () => {
    it('OAuth 타입이 서비스에서 제공하는 타입이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.type = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('OAuth 타입이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.type = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
