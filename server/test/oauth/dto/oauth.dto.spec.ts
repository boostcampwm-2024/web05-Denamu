import { validate } from 'class-validator';
import { OAuthTypeRequestDto } from '../../../src/user/dto/request/oAuthType.dto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';

describe('OAuthTypeRequestDto Test', () => {
  let dto: OAuthTypeRequestDto;

  beforeEach(() => {
    dto = new OAuthTypeRequestDto({
      type: OAuthType.Google,
    });
  });

  it('OAuth 타입이 타입 목록에 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('type', () => {
    it('OAuth 타입이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.type = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('OAuth 타입이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.type = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('OAuth 타입이 타입 목록에 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.type = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
