import { validate } from 'class-validator';
import { UpdateCommentRequestDto } from '../../../src/comment/dto/request/updateComment.dto';

describe('EditCommentRequestDto Test', () => {
  let dto: UpdateCommentRequestDto;

  beforeEach(() => {
    dto = new UpdateCommentRequestDto({
      commentId: 1,
      newComment: 'test',
    });
  });

  describe('newComment', () => {
    it('댓글 내용이 비어있다면 유효성 검사에 실패한다.', async () => {
      // given
      dto.newComment = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('댓글 내용이 문자열이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.newComment = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('commentId', () => {
    it('댓글 아이디가 없을 경우 유효성 검사에 실패한다.', async () => {
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
