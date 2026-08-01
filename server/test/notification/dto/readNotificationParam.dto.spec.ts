import { validate } from 'class-validator';

import { ReadNotificationParamRequestDto } from '@notification/dto/request/readNotificationParam.dto';

describe(`${ReadNotificationParamRequestDto.name} Test`, () => {
  let dto: ReadNotificationParamRequestDto;

  beforeEach(() => {
    dto = new ReadNotificationParamRequestDto({
      notificationId: 1,
    });
  });

  it('알림 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('notificationId', () => {
    it('알림 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.notificationId = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('알림 ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.notificationId = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('알림 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.notificationId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
