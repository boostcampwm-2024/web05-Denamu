import { validate } from 'class-validator';

import { GetRssFeedsRequestDto } from '@rss/dto/request/getRssFeeds.dto';

describe(`${GetRssFeedsRequestDto.name} Test`, () => {
  let dto: GetRssFeedsRequestDto;

  beforeEach(() => {
    dto = new GetRssFeedsRequestDto({
      lastId: 1,
      limit: 10,
    });
  });

  it('lastId와 limit이 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('lastId를 생략해도 유효성 검사에 성공한다(첫 페이지).', async () => {
    // given
    dto = new GetRssFeedsRequestDto({ limit: 10 });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('lastId', () => {
    it('lastId가 1 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.lastId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('limit', () => {
    it('limit이 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 1.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
