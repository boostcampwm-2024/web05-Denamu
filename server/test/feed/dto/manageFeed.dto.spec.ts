import { validate } from 'class-validator';
import { ManageFeedRequestDto } from '../../../src/feed/dto/request/manageFeed.dto';

describe('ManageFeedRequestDto Test', () => {
  describe('feedId', () => {
    it('feedId에 1보다 작은 값을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      const feedPaginationQueryDto = new ManageFeedRequestDto({
        feedId: -1,
      });

      //when
      const errors = await validate(feedPaginationQueryDto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('feedId에 자연수가 아닌 실수를 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      const feedPaginationQueryDto = new ManageFeedRequestDto({
        feedId: 1.254,
      });

      //when
      const errors = await validate(feedPaginationQueryDto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('feedId에 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      const feedPaginationQueryDto = new ManageFeedRequestDto({
        feedId: 'abcdefg' as any,
      });

      //when
      const errors = await validate(feedPaginationQueryDto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
