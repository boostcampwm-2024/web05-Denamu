import { validate } from 'class-validator';

import { SendMarketingEmailRequestDto } from '@marketingEmail/dto/request/sendMarketingEmail.dto';

describe(`${SendMarketingEmailRequestDto.name} Test`, () => {
  let dto: SendMarketingEmailRequestDto;

  beforeEach(() => {
    dto = new SendMarketingEmailRequestDto({
      subject: '8월 신규 기능 소식을 전해드려요',
      content: '<p>이번 달 새로운 기능을 소개합니다.</p>',
    });
  });

  it('제목과 본문이 모두 올바를 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('제목이 255자 경계값일 경우 유효성 검사에 성공한다.', async () => {
    // given
    dto.subject = 'a'.repeat(255);

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('subject', () => {
    it('제목이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.subject = undefined;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('제목이 문자열이 아닌 숫자일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.subject = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('제목이 255자를 초과할 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.subject = 'a'.repeat(256);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('content', () => {
    it('본문이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.content = undefined;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('본문이 문자열이 아닌 객체일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.content = { text: 'test' } as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
