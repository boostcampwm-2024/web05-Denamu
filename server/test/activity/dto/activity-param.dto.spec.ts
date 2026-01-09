import { ReadActivityParamRequestDto } from '@src/activity/dto/request/readActivity.dto';
import { validate } from 'class-validator';

describe(`${ReadActivityParamRequestDto.name} Test`, () => {
  let dto: ReadActivityParamRequestDto;

  beforeEach(() => {
    dto = new ReadActivityParamRequestDto({
      userId: 1,
    });
  });

  it('유저 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('userId', () => {
    it('유저 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 'invalid' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('유저 ID가 정수가 아니고 실수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 1.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('유저 ID가 1 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('유저 ID가 음수일 경우 유효성 검사에 실패한다.', async () => {
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
