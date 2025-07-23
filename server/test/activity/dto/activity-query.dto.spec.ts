import { validate } from 'class-validator';
import { ActivityQueryRequestDto } from '../../../src/activity/dto/request/activity-query.dto';

describe('ActivityQueryRequestDto Test', () => {
  it('정상적인 year로 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 2024,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('year가 정수가 아닌 문자열이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 'invalid' as any,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('year가 정수가 아닌 실수이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 2024.5 as any,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('year가 2000년 미만이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 1999,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('year가 3000년 초과이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 3001,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('year가 2000년이면 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 2000,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('year가 3000년이면 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new ActivityQueryRequestDto({
      year: 3000,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });
});
