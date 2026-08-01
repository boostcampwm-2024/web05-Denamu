import { validate } from 'class-validator';

import { GetBoardRequestDto } from '@board/dto/request/getBoard.dto';

describe(`${GetBoardRequestDto.name} Test`, () => {
  let dto: GetBoardRequestDto;

  beforeEach(() => {
    dto = new GetBoardRequestDto({
      id: 1,
    });
  });

  it('게시글 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('id', () => {
    it('게시글 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('게시글 ID가 정수가 아닌 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('게시글 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
