import { LoginAdminRequestDto } from '../../../src/admin/dto/request/loginAdmin.dto';
import { validate } from 'class-validator';
import { AdminFixture } from '../../fixture/admin.fixture';

describe('LoginAdminRequestDto Test', () => {
  let dto: LoginAdminRequestDto;

  beforeEach(() => {
    dto = new LoginAdminRequestDto(AdminFixture.createAdminFixture());
  });

  it('ID와 패스워드가 있을 경우 유효성 검사에 성공한다.', async () => {
    //when
    const errors = await validate(dto);

    //then
    expect(errors).toHaveLength(0);
  });

  describe('loginId', () => {
    it('ID에 null이 입력되면 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('password', () => {
    it('패스워드에 null이 입력되면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
