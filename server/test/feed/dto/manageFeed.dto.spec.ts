import { validate } from 'class-validator';
import { ManageFeedRequestDto } from '../../../src/feed/dto/request/manageFeed.dto';

describe('ManageFeedRequestDto Test', () => {
  let dto: ManageFeedRequestDto;

  beforeEach(() => {
    dto = new ManageFeedRequestDto({
      feedId: 1,
    });
  });

  it('게시글 아이디가 1보다 큰 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('feedId', () => {
    it('feedId가 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('feedId에 1보다 작은 값을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('feedId에 자연수가 아닌 실수를 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = 1.254;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('feedId에 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = 'abcdefg' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
