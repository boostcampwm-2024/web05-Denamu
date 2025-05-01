import { validate } from 'class-validator';
import { DeleteCommentRequestDto } from '../../../src/comment/dto/request/delete-comment.dto';

describe('RemoveCommentRequestDto Test', () => {
  it('댓글 아이디가 비어있다면 유효성 검사에 실패한다.', async () => {
    // given
    const removeCommentDto = new DeleteCommentRequestDto({
      commentId: null,
    });

    // when
    const errors = await validate(removeCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
  it('댓글 아이디가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
    // given
    const removeCommentDto = new DeleteCommentRequestDto({
      commentId: 'test' as any,
    });

    // when
    const errors = await validate(removeCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
