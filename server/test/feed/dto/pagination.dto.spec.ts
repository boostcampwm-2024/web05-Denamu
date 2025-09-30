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

  it('게시글 제한과 마지막 아이디가 1보다 큰 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
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

  describe('tags', () => {
    it('tags에 존재하지 않는 태그를 입력할 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.tags = ['TEST'] as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });
  });
});
