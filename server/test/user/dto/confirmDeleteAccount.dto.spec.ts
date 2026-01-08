import { validate } from 'class-validator';
import { ConfirmDeleteAccountDto } from '../../../src/user/dto/request/confirmDeleteAccount.dto';

describe(`${ConfirmDeleteAccountDto.name} Test`, () => {
  let dto: ConfirmDeleteAccountDto;

  beforeEach(() => {
    dto = new ConfirmDeleteAccountDto({
      token: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    });
  });

  it('토큰이 유효할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('token', () => {
    it('토큰이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.token = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('토큰이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.token = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
