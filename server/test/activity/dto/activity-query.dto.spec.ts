import { validate } from 'class-validator';
import { ReadActivityQueryRequestDto } from '../../../src/activity/dto/request/readActivity.dto';

describe(`${ReadActivityQueryRequestDto.name} Test`, () => {
  let dto: ReadActivityQueryRequestDto;

  beforeEach(() => {
    dto = new ReadActivityQueryRequestDto({
      year: 2024,
    });
  });

  it('연도가 2000보다 크고 3000보다 작을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('year', () => {
    it('연도가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 'invalid' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('연도가 정수가 아니고 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 2024.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('연도가 2000년 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 1999;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('연도가 3000년 초과일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.year = 3001;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('연도가 2000년일 경우 유효성 검사에 통과한다.', async () => {
      // given
      dto.year = 2000;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('연도가 3000년일 경우 유효성 검사에 통과한다.', async () => {
      // given
      dto.year = 3000;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });
  });
});
