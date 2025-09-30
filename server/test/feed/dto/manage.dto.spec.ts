import { validate } from 'class-validator';
import { ManageFeedRequestDto } from '../../../src/feed/dto/request/manageFeed.dto';

describe('ManageFeedRequestDto Test', () => {
  let dto: ManageFeedRequestDto;

  beforeEach(() => {
    dto = new ManageFeedRequestDto({
      feedId: 1,
    });
  });

  it('피드 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('feedId', () => {
    it('피드 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('피드 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('피드 ID가 1 이상의 실수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.feedId = 1.254;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('피드 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
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
