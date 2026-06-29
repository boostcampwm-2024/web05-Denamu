import { validate } from 'class-validator';

import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';

describe(`${LoginAdminRequestDto.name} Test`, () => {
  let dto: LoginAdminRequestDto;

  beforeEach(() => {
    dto = new LoginAdminRequestDto(AdminFixture.createAdminFixture());
  });

  it('이메일과 패스워드가 정책에 부합할 경우 유효성 검사에 성공한다.', async () => {
    //when
    const errors = await validate(dto);

    //then
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('이메일이 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.email = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일 형식이 아닐 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.email = 'not-an-email';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('password', () => {
    it('패스워드가 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('패스워드가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('패스워드가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 1 as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
