import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';

describe(`${CreateCommentRequestDto.name} Test`, () => {
  it('댓글 내용만 있을 경우(최상위 댓글) 유효성 검사에 성공한다.', async () => {
    // given
    const dto = new CreateCommentRequestDto({ comment: '댓글 내용' });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('댓글 내용과 parentId가 있을 경우(답글) 유효성 검사에 성공한다.', async () => {
    // given
    const dto = new CreateCommentRequestDto({ comment: '답글', parentId: 1 });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('comment', () => {
    it('댓글 내용이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      const dto = new CreateCommentRequestDto({ comment: '' });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('댓글 내용이 문자열이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      const dto = new CreateCommentRequestDto({ comment: 123 as any });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('parentId', () => {
    it('parentId가 없을 경우(undefined) 유효성 검사에 성공한다.', async () => {
      // given
      const dto = new CreateCommentRequestDto({ comment: '댓글 내용' });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('parentId가 1 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      const dto = new CreateCommentRequestDto({ comment: '답글', parentId: 0 });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('parentId가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given - 변환 후에도 정수가 아니어야 하므로 transform을 거친다.
      const dto = plainToInstance(CreateCommentRequestDto, {
        comment: '답글',
        parentId: 'abc',
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
