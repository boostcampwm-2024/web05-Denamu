import { validate } from 'class-validator';
import { ReadStatisticRequestDto } from '../../../src/statistic/dto/request/readStatistic.dto';

describe('StatisticQueryDto', () => {
  describe('limit', () => {
    it('실수를 입력한다.', async () => {
      // given
      const dto = new ReadStatisticRequestDto({
        limit: 1.1,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty(
        'isInt',
        '정수로 입력해주세요.',
      );
    });

    it('문자열을 입력한다.', async () => {
      // given
      const dto = new ReadStatisticRequestDto({
        limit: 'test' as any,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty(
        'isInt',
        '정수로 입력해주세요.',
      );
    });

    it('음수를 입력한다.', async () => {
      // given
      const dto = new ReadStatisticRequestDto({
        limit: -1,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty(
        'min',
        'limit 값은 1 이상이어야 합니다.',
      );
    });
  });
});
