import { validate } from 'class-validator';
import { ActivityParamRequestDto } from '../../../src/activity/dto/request/activity-param.dto';

describe('ActivityParamRequestDto Test', () => {
  it('정상적인 userId로 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new ActivityParamRequestDto({
      userId: 1,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('userId가 정수가 아닌 문자열이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityParamRequestDto({
      userId: 'invalid' as any,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('userId가 정수가 아닌 실수이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityParamRequestDto({
      userId: 1.5 as any,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('userId가 1보다 작으면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityParamRequestDto({
      userId: 0,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('userId가 음수이면 유효성 검사에 실패한다.', async () => {
    // given
    const dto = new ActivityParamRequestDto({
      userId: -1,
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });
});
