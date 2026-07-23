import { validate } from 'class-validator';

import { ManageBlockRequestDto } from '@block/dto/request/manageBlock.dto';

describe(`${ManageBlockRequestDto.name} Test`, () => {
  let dto: ManageBlockRequestDto;

  beforeEach(() => {
    dto = new ManageBlockRequestDto({
      userId: 1,
    });
  });

  it('사용자 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('userId', () => {
    it('사용자 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('사용자 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('사용자 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
