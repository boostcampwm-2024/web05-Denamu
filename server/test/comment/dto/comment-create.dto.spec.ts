import { validate } from 'class-validator';
import { CreateCommentRequestDto } from '../../../src/comment/dto/request/create-comment.dto';

describe('CreateCommentRequestDto Test', () => {
  it('댓글 내용이 비어있다면 유효성 검사에 실패한다.', async () => {
    // given
    const createCommentDto = new CreateCommentRequestDto({
      comment: null,
      feedId: 1,
    });

    // when
    const errors = await validate(createCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
  it('댓글 내용이 문자열이 아닐 경우 유효성 검사에 실패한다.', async () => {
    // given
    const createCommentDto = new CreateCommentRequestDto({
      comment: 1 as any,
      feedId: 1,
    });

    // when
    const errors = await validate(createCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });
  it('피드 아이디가 없을 경우 유효성 검사에 실패한다.', async () => {
    // given
    const createCommentDto = new CreateCommentRequestDto({
      comment: 'test',
      feedId: null,
    });

    // when
    const errors = await validate(createCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
  it('피드 아이디가 정수가 아닐 경우 유효성 검사에 실패한다.', async () => {
    // given
    const createCommentDto = new CreateCommentRequestDto({
      comment: 'test',
      feedId: 'test' as any,
    });

    // when
    const errors = await validate(createCommentDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
