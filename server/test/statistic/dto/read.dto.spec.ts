import { validate } from 'class-validator';
import { ReadStatisticRequestDto } from '@src/statistic/dto/request/readStatistic.dto';

describe(`${ReadStatisticRequestDto.name} Test`, () => {
  let dto: ReadStatisticRequestDto;

  beforeEach(() => {
    dto = new ReadStatisticRequestDto({
      limit: 1,
    });
  });

  it('통계 결과 개수가 1 이상의 정수일 경우 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('limit', () => {
    it('통계 결과 개수가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = -1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('통계 결과 개수가 정수가 아닌 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 1.1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('통계 결과 개수가 정수가 아닌 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });
});
