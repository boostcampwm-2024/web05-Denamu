import { validate } from 'class-validator';
import { DeleteCommentRequestDto } from '../../../src/comment/dto/request/deleteComment.dto';

describe('DeleteCommentRequestDto Test', () => {
  let dto: DeleteCommentRequestDto;

  beforeEach(() => {
    dto = new DeleteCommentRequestDto({
      commentId: 1,
    });
  });

  it('댓글 아이디가 1보다 큰 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('commentId', () => {
    it('댓글 아이디가 비어있다면 유효성 검사에 실패한다.', async () => {
      // given
      dto.commentId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('댓글 아이디가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.commentId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('댓글 아이디가 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.commentId = 1.1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
