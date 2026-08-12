import { validate } from 'class-validator';

import { GetAllRssRequestDto } from '@rss/dto/request/getAllRss.dto';

describe(`${GetAllRssRequestDto.name} Test`, () => {
  let dto: GetAllRssRequestDto;

  beforeEach(() => {
    dto = new GetAllRssRequestDto({
      page: 1,
      limit: 20,
    });
  });

  it('page와 limit이 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('page와 limit을 생략해도 유효성 검사에 성공한다.', async () => {
    // given
    dto = new GetAllRssRequestDto({});

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('page', () => {
    it('페이지 번호가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.page = 1.1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('페이지 번호가 1 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.page = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('limit', () => {
    it('개수 제한이 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 1.1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('개수 제한이 1 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('개수 제한이 100을 초과할 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 101;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });

  describe('blogPlatform', () => {
    it('허용된 플랫폼 값이면 유효성 검사에 성공한다.', async () => {
      // given
      dto.blogPlatform = 'velog';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('생략해도 유효성 검사에 성공한다.', async () => {
      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('허용되지 않은 값이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogPlatform = 'blogger';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });
  });
});
