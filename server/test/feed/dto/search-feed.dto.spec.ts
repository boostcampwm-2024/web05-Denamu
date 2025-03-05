import {
  SearchFeedRequestDto,
  SearchType,
} from '../../../src/feed/dto/request/search-feed.dto';
import { validate } from 'class-validator';

describe('SearchFeedRequestDto Test', () => {
  //given
  let searchFeedDto: SearchFeedRequestDto;

  beforeEach(() => {
    searchFeedDto = new SearchFeedRequestDto({
      find: 'test',
      type: SearchType.TITLE,
      page: 1,
      limit: 1,
    });
  });

  it('검색어를 입력하지 않는다.', async () => {
    //given
    delete searchFeedDto.find;
    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('검색 타입을 입력하지 않는다.', async () => {
    //given
    delete searchFeedDto.type;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('검색 타입을 잘 못된 입력을 한다.', async () => {
    //given
    searchFeedDto.type = 'test' as any;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('페이지 번호를 정수가 아닌 문자열로 입력한다.', async () => {
    //given
    searchFeedDto.page = 'abcdefg' as any;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('페이지 번호를 정수가 아닌 실수로 입력한다.', async () => {
    //given
    searchFeedDto.page = 1.1 as any;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('페이지 번호를 양수가 아닌 음수로 입력한다.', async () => {
    //given
    searchFeedDto.page = -1;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('limit를 정수가 아닌 문자열로 입력한다.', async () => {
    //given
    searchFeedDto.limit = 'test' as any;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('limit를 정수가 아닌 실수로 입력한다.', async () => {
    //given
    searchFeedDto.limit = 1.1;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('limit를 양수가 아닌 음수로 입력한다.', async () => {
    //given
    searchFeedDto.limit = -1;

    //when
    const errors = await validate(searchFeedDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });
});
