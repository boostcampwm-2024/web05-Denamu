import { validate } from 'class-validator';

import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';

describe(`${UpdateCommentRequestDto.name} Test`, () => {
  let dto: UpdateCommentRequestDto;

  beforeEach(() => {
    dto = new UpdateCommentRequestDto({
      commentId: 1,
      newComment: 'test',
    });
  });

  it('댓글 ID가 1 이상의 정수이며 댓글 내용이 있을 경우 유효성 검사에 성공한다.', async () => {
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

  describe('newComment', () => {
    it('댓글 내용이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.newComment = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('댓글 내용이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.newComment = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('댓글 내용이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.newComment = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
