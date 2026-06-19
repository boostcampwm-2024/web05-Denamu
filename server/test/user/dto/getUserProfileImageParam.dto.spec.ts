import { validate } from 'class-validator';

import { GetUserProfileParamRequestDto } from '@user/dto/request/getUserProfileParam.dto';

describe(`${GetUserProfileParamRequestDto.name} Test`, () => {
  let dto: GetUserProfileParamRequestDto;

  beforeEach(() => {
    dto = new GetUserProfileParamRequestDto({ id: 1 });
  });

  it('사용자 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('id', () => {
    it('사용자 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('사용자 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
