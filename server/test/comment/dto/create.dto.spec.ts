import { validate } from 'class-validator';

import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';

describe(`${CreateCommentRequestDto.name} Test`, () => {
  let dto: CreateCommentRequestDto;

  beforeEach(() => {
    dto = new CreateCommentRequestDto({
      comment: 'test',
      feedId: 1,
    });
  });

  it('댓글 내용과 피드 ID가 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('comment', () => {
    it('댓글 내용이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.comment = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('댓글 내용이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.comment = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('댓글 내용이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.comment = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('feedId', () => {
    it('피드 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('피드 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.feedId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
