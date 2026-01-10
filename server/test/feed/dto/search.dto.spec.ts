import {
  SearchFeedRequestDto,
  SearchType,
} from '@feed/dto/request/searchFeed.dto';

import { validate } from 'class-validator';

describe(`${SearchFeedRequestDto.name} Test`, () => {
  let dto: SearchFeedRequestDto;

  beforeEach(() => {
    dto = new SearchFeedRequestDto({
      find: 'test',
      type: SearchType.TITLE,
      page: 1,
      limit: 1,
    });
  });

  it('검색 내용과 타입이 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('find', () => {
    it('검색어가 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.find = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색어가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.find = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색어가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.find = 1 as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('type', () => {
    it('검색 타입이 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.type = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색 타입이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.type = '' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색 타입이 잘못된 입력일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.type = 'test' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('page', () => {
    it('페이지 번호가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.page = 'abcdefg' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('페이지 번호가 1 이상의 실수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.page = 1.1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('페이지 번호가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.page = 0;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('limit', () => {
    it('검색 결과 개수 제한이 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = 'test' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('검색 결과 개수 제한이 정수가 아니고 실수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = 1.1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('검색 결과 개수 제한이 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = 0;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
