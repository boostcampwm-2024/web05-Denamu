import {
  SearchFeedRequestDto,
  SearchType,
} from '../../../src/feed/dto/request/searchFeed.dto';
import { validate } from 'class-validator';

describe('SearchFeedRequestDto Test', () => {
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
    it('검색어를 입력하지 않는다.', async () => {
      //given
      dto.find = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색어에 빈 문자열을 입력할 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.find = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색어에 문자열이 아닌 값을 입력할 경우 유효성 검사에 실패한다.', async () => {
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
    it('검색 타입을 입력하지 않는다.', async () => {
      //given
      dto.type = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색 타입에 빈 문자열을 입력한다.', async () => {
      //given
      dto.type = '' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('검색 타입을 잘 못된 입력을 한다.', async () => {
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
    it('페이지 번호를 정수가 아닌 문자열로 입력한다.', async () => {
      //given
      dto.page = 'abcdefg' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('페이지 번호를 정수가 아닌 실수로 입력한다.', async () => {
      //given
      dto.page = 1.1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('페이지 번호를 양수가 아닌 음수로 입력한다.', async () => {
      //given
      dto.page = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('limit', () => {
    it('limit를 정수가 아닌 문자열로 입력한다.', async () => {
      //given
      dto.limit = 'test' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('limit를 정수가 아닌 실수로 입력한다.', async () => {
      //given
      dto.limit = 1.1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('limit를 양수가 아닌 음수로 입력한다.', async () => {
      //given
      dto.limit = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
