import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateAdminProfileRequestDto } from '@admin/dto/request/updateAdminProfile.dto';

describe(`${UpdateAdminProfileRequestDto.name} Test`, () => {
  const toDto = (partial: Partial<UpdateAdminProfileRequestDto>) =>
    plainToInstance(UpdateAdminProfileRequestDto, partial);

  it('모든 필드가 없어도 유효성 검사에 성공한다. (부분 수정)', async () => {
    // when
    const errors = await validate(toDto({}));

    // then
    expect(errors).toHaveLength(0);
  });

  it('정책에 부합하는 값이면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(
      toDto({ name: '홍길동', password: 'test1234!', emailNotification: true }),
    );

    // then
    expect(errors).toHaveLength(0);
  });

  describe('name', () => {
    it('이름이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // when
      const errors = await validate(toDto({ name: '' }));

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('이름이 255자를 초과하면 유효성 검사에 실패한다.', async () => {
      // when
      const errors = await validate(toDto({ name: 'a'.repeat(256) }));

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });
  });

  describe('password', () => {
    it('비밀번호 길이가 6 미만이면 유효성 검사에 실패한다.', async () => {
      // when
      const errors = await validate(toDto({ password: 'a1!' }));

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('특수문자가 없으면 유효성 검사에 실패한다.', async () => {
      // when
      const errors = await validate(toDto({ password: 'testAdminPassword' }));

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('emailNotification', () => {
    it('불리언이 아니면 유효성 검사에 실패한다.', async () => {
      // when
      const errors = await validate(
        toDto({ emailNotification: 'true' as unknown as boolean }),
      );

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
