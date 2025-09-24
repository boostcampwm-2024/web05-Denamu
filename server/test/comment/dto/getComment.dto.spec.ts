import { GetCommentRequestDto } from '../../../src/comment/dto/request/getComment.dto';
import { validate } from 'class-validator';

describe('GetCommentRequestDto Test', () => {
  let dto: GetCommentRequestDto;

  beforeEach(() => {
    dto = new GetCommentRequestDto({
      feedId: 1,
    });
  });

  it('게시글 ID가 1보다 큰 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('feedId', () => {
    it('게시글 아이디가 비어있다면 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('게시글 아이디가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('게시글 아이디가 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = 1.1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
