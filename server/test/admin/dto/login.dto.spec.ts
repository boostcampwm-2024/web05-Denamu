import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { validate } from 'class-validator';
import { AdminFixture } from '@test/config/common/fixture/admin.fixture';

describe(`${LoginAdminRequestDto.name} Test`, () => {
  let dto: LoginAdminRequestDto;

  beforeEach(() => {
    dto = new LoginAdminRequestDto(AdminFixture.createAdminFixture());
  });

  it('ID와 패스워드가 문자열일 경우 유효성 검사에 성공한다.', async () => {
    //when
    const errors = await validate(dto);

    //then
    expect(errors).toHaveLength(0);
  });

  describe('loginId', () => {
    it('로그인 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('로그인 ID가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('로그인 ID가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = 1 as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
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
