import { validate } from 'class-validator';
import { ReadFeedPaginationRequestDto } from '../../../src/feed/dto/request/readFeedPagination.dto';

describe('ReadFeedPaginationRequestDto Test', () => {
  let dto: ReadFeedPaginationRequestDto;

  beforeEach(() => {
    dto = new ReadFeedPaginationRequestDto({
      limit: 1,
      lastId: 1,
    });
  });

  describe('limit', () => {
    it('limit에 1보다 작은 값을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('limit에 자연수가 아닌 실수를 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = 1.254;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('limit에 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = 'abcdefg' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('lastId', () => {
    it('lastId에 음수를 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.lastId = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('lastId에 자연수가 아닌 실수를 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.lastId = 1.254;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('lastId에 문자열을 입력하면 유효성 검사에 실패한다.', async () => {
      //given
      dto.lastId = 'abcdefg' as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
