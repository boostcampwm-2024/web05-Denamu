import { validate } from 'class-validator';
import { OAuthCallbackRequestDto } from '../../../src/user/dto/request/oAuthCallbackDto';

describe('OAuthCallbackRequestDto Test', () => {
  let dto: OAuthCallbackRequestDto;

  beforeEach(() => {
    dto = new OAuthCallbackRequestDto({
      code: 'test',
      state: Buffer.from(JSON.stringify({ provider: 'Google' })).toString(
        'base64',
      ),
    });
  });

  it('OAuth Callback에 코드와 상태가 문자열로 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('code', () => {
    it('code가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.code = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('code가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.code = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('code가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.code = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('state', () => {
    it('state가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.state = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('state가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.state = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('state가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.state = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
