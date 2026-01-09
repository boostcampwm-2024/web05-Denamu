import { validate } from 'class-validator';
import { ReadFeedPaginationRequestDto } from '@src/feed/dto/request/readFeedPagination.dto';

describe(`${ReadFeedPaginationRequestDto.name} Test`, () => {
  let dto: ReadFeedPaginationRequestDto;

  beforeEach(() => {
    dto = new ReadFeedPaginationRequestDto({
      limit: 1,
      lastId: 1,
    });
  });

  it('게시글 제한과 마지막 피드 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('lastId', () => {
    it('마지막 피드 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.lastId = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('마지막 피드 ID가 1 이상의 실수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.lastId = 1.254;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('마지막 피드 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
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
    it('게시글 제한이 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('게시글 제한이 1 이상의 실수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.limit = 1.254;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('게시글 제한이 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
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
    it('태그에 유효하지 않은 값을 입력할 경우 유효성 검사에 실패한다.', async () => {
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
