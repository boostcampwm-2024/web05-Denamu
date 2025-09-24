import { ReadActivityParamRequestDto } from './../../../src/activity/dto/request/readActivity.dto';
import { validate } from 'class-validator';

describe('ReadActivityParamRequestDto Test', () => {
  let dto: ReadActivityParamRequestDto;

  beforeEach(() => {
    dto = new ReadActivityParamRequestDto({
      userId: 1,
    });
  });

  it('정상적인 userId로 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('userId', () => {
    it('userId가 정수가 아닌 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 'invalid' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('userId가 정수가 아닌 실수이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 1.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('userId가 1보다 작으면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('userId가 음수이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = -1;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
