import { validate } from 'class-validator';

import { GetNotificationsRequestDto } from '@notification/dto/request/getNotifications.dto';

describe(`${GetNotificationsRequestDto.name} Test`, () => {
  let dto: GetNotificationsRequestDto;

  beforeEach(() => {
    dto = new GetNotificationsRequestDto({
      limit: 20,
    });
  });

  it('limit이 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('limit은 선택값이므로 없어도 유효성 검사에 성공한다.', async () => {
    // given
    dto = new GetNotificationsRequestDto({});

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('limit', () => {
    it('정수가 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 1.5;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('1 미만이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.limit = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
