import { validate } from 'class-validator';

import { GetAdminMarketingEmailsRequestDto } from '@marketingEmail/dto/request/getAdminMarketingEmails.dto';

describe(`${GetAdminMarketingEmailsRequestDto.name} Test`, () => {
  let dto: GetAdminMarketingEmailsRequestDto;

  beforeEach(() => {
    dto = new GetAdminMarketingEmailsRequestDto({ page: 1, limit: 10 });
  });

  it('page와 limit이 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('page와 limit이 입력되지 않을 경우 기본값이 적용되어 유효성 검사에 성공한다.', async () => {
    // given
    const defaultDto = new GetAdminMarketingEmailsRequestDto({});

    // when
    const errors = await validate(defaultDto);

    // then
    expect(errors).toHaveLength(0);
    expect(defaultDto.page).toBe(1);
    expect(defaultDto.limit).toBe(10);
  });

  describe('page', () => {
    it('page가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.page = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('page가 정수가 아닌 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.page = 1.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('limit', () => {
    it('limit이 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('limit이 정수가 아닌 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
