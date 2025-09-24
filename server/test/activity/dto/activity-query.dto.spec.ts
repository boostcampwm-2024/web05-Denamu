import { validate } from 'class-validator';
import { ReadActivityQueryRequestDto } from '../../../src/activity/dto/request/readActivity.dto';

describe('ActivityQueryRequestDto Test', () => {
  let dto: ReadActivityQueryRequestDto;

  beforeEach(() => {
    dto = new ReadActivityQueryRequestDto({
      year: 2024,
    });
  });

  it('정상적인 year로 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('year', () => {
    it('year가 정수가 아닌 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 'invalid' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('year가 정수가 아닌 실수이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 2024.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('year가 2000년 미만이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 1999;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('year가 3000년 초과이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 3000;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('year가 2000년이면 유효성 검사를 통과한다.', async () => {
      // given
      dto.year = 2000;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('year가 3000년이면 유효성 검사를 통과한다.', async () => {
      // given
      dto.year = 3000;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });
  });
});
