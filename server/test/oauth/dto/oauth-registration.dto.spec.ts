import { validate } from 'class-validator';

import { OAuthRegistrationRequestDto } from '@user/dto/request/oAuthRegistration.dto';

describe('OAuthRegistrationRequestDto Test', () => {
  let dto: OAuthRegistrationRequestDto;

  beforeEach(() => {
    dto = new OAuthRegistrationRequestDto({
      userName: '홍길동',
    });
  });

  it('닉네임만 있어도 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('userName', () => {
    it('닉네임이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('이메일 수신 동의', () => {
    it('동의 값이 모두 있어도 유효성 검사에 성공한다.', async () => {
      // given
      dto.marketingEmailAgreed = true;
      dto.inactivityEmailAgreed = false;
      dto.noticeEmailAgreed = false;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('marketingEmailAgreed가 boolean이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.marketingEmailAgreed = 'true' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('inactivityEmailAgreed가 boolean이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.inactivityEmailAgreed = 'true' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('noticeEmailAgreed가 boolean이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.noticeEmailAgreed = 'true' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
