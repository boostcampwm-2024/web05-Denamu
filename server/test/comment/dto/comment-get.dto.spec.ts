import { validate } from 'class-validator';
import { GetCommentRequestDto } from '../../../src/comment/dto/request/get-comment.dto';

describe('GetCommentRequestDto Test', () => {
  it('게시글 아이디가 비어있다면 유효성 검사에 실패한다.', async () => {
    // given
    const getCommentDto = new GetCommentRequestDto({
      feedId: null,
    });

    // when
    const errors = await validate(getCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
  it('게시글 아이디가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
    // given
    const getCommentDto = new GetCommentRequestDto({
      feedId: 'test' as any,
    });

    // when
    const errors = await validate(getCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
