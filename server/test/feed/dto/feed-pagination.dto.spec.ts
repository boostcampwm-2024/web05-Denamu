import { validate } from 'class-validator';
import { FeedPaginationRequestDto } from '../../../src/feed/dto/request/feed-pagination.dto';
import { ALLOWED_TAGS } from '../../../src/feed/tagType.constants';

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

  it('허용되지 않은 태그를 포함하면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new FeedPaginationRequestDto({ tags: ['not_a_tag' as any] });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('허용된 태그와 허용되지 않은 태그가 섞여 있으면 유효성 검사에 실패한다.', async () => {
    // given
    const mixed = [ALLOWED_TAGS[0], 'invalid_tag' as any];
    const dto = new FeedPaginationRequestDto({ tags: mixed });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });
});
