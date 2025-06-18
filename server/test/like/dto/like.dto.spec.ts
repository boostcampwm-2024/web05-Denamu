import { validate } from 'class-validator';
import { FeedLikeRequestDto } from '../../../src/like/dto/request/like.dto';

describe('FeedLikeRequestDto Test', () => {
  it('피드 ID가 없으면 유효성 검사에 실패한다.', async () => {
    // given
    const feedLikeRequestDto = new FeedLikeRequestDto({});

    // when
    const errors = await validate(feedLikeRequestDto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
  it('피드 ID가 정수가 아니면 유효성 검사에 실패한다.', async () => {
    // given
    const feedLikeRequestDto = new FeedLikeRequestDto({
      feedId: 'test' as any,
    });

    // when
    const errors = await validate(feedLikeRequestDto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
  it('피드 ID가 정수면 유효성 검사에 성공한다.', async () => {
    // given
    const feedLikeRequestDto = new FeedLikeRequestDto({
      feedId: 1,
    });

    // when
    const errors = await validate(feedLikeRequestDto);

    // then
    expect(errors).toHaveLength(0);
  });
});
