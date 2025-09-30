import { validate } from 'class-validator';
import { OAuthTypeRequestDto } from '../../../src/user/dto/request/oAuthType.dto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';

describe('OAuthTypeRequest Test', () => {
  let dto: OAuthTypeRequestDto;

  beforeEach(() => {
    dto = new OAuthTypeRequestDto({
      type: OAuthType.Google,
    });
  });

  it('type이 OAuthType에 적합할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('type', () => {
    it('type이 OAuthType이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.type = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('type이 없으면 유효성 검사에 실패한다.', async () => {
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
