import { validate } from 'class-validator';
import { FeedPaginationRequestDto } from '../../../src/feed/dto/request/feed-pagination.dto';

describe('FeedPaginationRequestDto Test', () => {
  it('limit에 1보다 작은 값을 입력하면 유효성 검사에 실패한다.', async () => {
    //given
    const feedPaginationQueryDto = new FeedPaginationRequestDto({
      limit: -1,
    });

    //when
    const errors = await validate(feedPaginationQueryDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('limit에 자연수가 아닌 실수를 입력하면 유효성 검사에 실패한다.', async () => {
    //given
    const feedPaginationQueryDto = new FeedPaginationRequestDto({
      limit: 1.254,
    });

    //when
    const errors = await validate(feedPaginationQueryDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('limit에 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
    //given
    const feedPaginationQueryDto = new FeedPaginationRequestDto({
      limit: 'abcdefg' as any,
    });

    //when
    const errors = await validate(feedPaginationQueryDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('lastId에 음수를 입력하면 유효성 검사에 실패한다.', async () => {
    //given
    const feedPaginationQueryDto = new FeedPaginationRequestDto({
      lastId: -1,
    });

    //when
    const errors = await validate(feedPaginationQueryDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('lastId에 자연수가 아닌 실수를 입력하면 유효성 검사에 실패한다.', async () => {
    //given
    const feedPaginationQueryDto = new FeedPaginationRequestDto({
      lastId: 1.254,
    });

    //when
    const errors = await validate(feedPaginationQueryDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('lastId에 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
    //given
    const feedPaginationQueryDto = new FeedPaginationRequestDto({
      lastId: 'abcdefg' as any,
    });

    //when
    const errors = await validate(feedPaginationQueryDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
