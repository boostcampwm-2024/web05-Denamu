import { DeleteCommentRequestDto } from '@comment/dto/request/deleteComment.dto';

import { validate } from 'class-validator';

describe(`${DeleteCommentRequestDto.name} Test`, () => {
  let dto: DeleteCommentRequestDto;

  beforeEach(() => {
    dto = new DeleteCommentRequestDto({
      commentId: 1,
    });
  });

  it('댓글 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('commentId', () => {
    it('댓글 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.commentId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('댓글 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.commentId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('댓글 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.commentId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
