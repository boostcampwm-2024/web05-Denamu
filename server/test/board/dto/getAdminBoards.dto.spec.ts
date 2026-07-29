import { validate } from 'class-validator';

import { BoardStatus } from '@board/constant/board.constant';
import { GetAdminBoardsRequestDto } from '@board/dto/request/getAdminBoards.dto';

describe(`${GetAdminBoardsRequestDto.name} Test`, () => {
  let dto: GetAdminBoardsRequestDto;

  beforeEach(() => {
    dto = new GetAdminBoardsRequestDto({
      page: 1,
      limit: 10,
      status: BoardStatus.PUBLISHED,
    });
  });

  it('page와 limit이 1 이상의 정수이고 status가 올바른 공개 상태일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('page와 limit이 입력되지 않을 경우 기본값이 적용되어 유효성 검사에 성공한다.', async () => {
    // given
    const defaultDto = new GetAdminBoardsRequestDto({});

    // when
    const errors = await validate(defaultDto);

    // then
    expect(errors).toHaveLength(0);
    expect(defaultDto.page).toBe(1);
    expect(defaultDto.limit).toBe(10);
  });

  it('status가 입력되지 않을 경우 유효성 검사에 성공한다.', async () => {
    // given
    dto.status = undefined;

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('page', () => {
    it('page가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.page = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('page가 정수가 아닌 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.page = 1.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('limit', () => {
    it('limit이 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('limit이 정수가 아닌 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('status', () => {
    it('status가 공개 상태 목록에 없는 값일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.status = 'DELETED' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('status가 문자열이 아닌 숫자일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.status = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
