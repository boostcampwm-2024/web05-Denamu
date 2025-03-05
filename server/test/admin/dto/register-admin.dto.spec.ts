import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/register-admin.dto';
import { validate } from 'class-validator';
import { AdminFixture } from '../../fixture/admin.fixture';

describe('LoginAdminDto Test', () => {
  it('ID의 길이가 6 이상, 255 이하가 아니라면 유효성 검사에 실패한다.', async () => {
    //given
    const registerAdminDto = new RegisterAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: 'test',
        password: 'testAdminPassword!',
      }),
    );

    //when
    const errors = await validate(registerAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('패스워드의 길이가 6 이상, 60 이하가 아니라면 유효성 검사에 실패한다.', async () => {
    //given
    const registerAdminDto = new RegisterAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: 'testId',
        password: 'test',
      }),
    );

    //when
    const errors = await validate(registerAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('패스워드에 특수문자가 하나 이상 없다면 유효성 검사에 실패한다.', async () => {
    //given
    const registerAdminDto = new RegisterAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: 'testAdminId',
        password: 'testAdminPassword',
      }),
    );

    //when
    const errors = await validate(registerAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('ID에 null이 입력되면 유효성 검사에 실패한다.', async () => {
    //given
    const registerAdminDto = new RegisterAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: null,
        password: 'testAdminPassword!',
      }),
    );

    //when
    const errors = await validate(registerAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('패스워드에 null이 입력되면 유효성 검사에 실패한다.', async () => {
    //given
    const registerAdminDto = new RegisterAdminRequestDto(
      AdminFixture.createAdminFixture({
        loginId: 'testAdminId',
        password: null,
      }),
    );

    //when
    const errors = await validate(registerAdminDto);

    //then
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
    expect(errors[0].constraints).toHaveProperty('matches');
  });
});
