import { LoginAdminRequestDto } from '../../../src/admin/dto/request/login-admin.dto';
import { validate } from 'class-validator';
import { AdminFixture } from '../../fixture/admin.fixture';

describe('LoginAdminDto Test', () => {
  it('ID에 null이 입력되면 유효성 검사에 실패한다.', async () => {
    //given
    const loginAdminDto = new LoginAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: null,
        password: 'testAdminPassword',
      }),
    );

    //when
    const errors = await validate(loginAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
  it('패스워드에 null이 입력되면 유효성 검사에 실패한다.', async () => {
    //given
    const loginAdminDto = new LoginAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: 'testAdminId',
        password: null,
      }),
    );

    //when
    const errors = await validate(loginAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
