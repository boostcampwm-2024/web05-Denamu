import { validate } from 'class-validator';

import { SearchRssRequestDto } from '@rss/dto/request/searchRss.dto';

describe(`${SearchRssRequestDto.name} Test`, () => {
  let dto: SearchRssRequestDto;

  beforeEach(() => {
    dto = new SearchRssRequestDto({
      find: 'seok3765',
      page: 1,
      limit: 5,
    });
  });

  it('검색어가 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('page와 limit을 생략해도 유효성 검사에 성공한다.', async () => {
    // given
    dto = new SearchRssRequestDto({ find: 'seok3765' });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('find', () => {
    it('검색어가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.find = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색어가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.find = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색어가 문자열이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.find = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
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
  });
});
