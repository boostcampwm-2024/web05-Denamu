import { validate } from 'class-validator';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';

describe('FeedLikeRequestDto Test', () => {
  let dto: ManageLikeRequestDto;

  beforeEach(() => {
    dto = new ManageLikeRequestDto({
      feedId: 1,
    });
  });

  it('피드 ID가 정수면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('feedId', () => {
    it('피드 ID가 없으면 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('피드 ID가 정수가 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
