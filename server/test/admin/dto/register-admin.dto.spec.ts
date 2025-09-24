import { AdminFixture } from './../../fixture/admin.fixture';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/registerAdmin.dto';
import { validate } from 'class-validator';

describe('LoginAdminDto Test', () => {
  let dto: RegisterAdminRequestDto;

  beforeEach(() => {
    dto = new RegisterAdminRequestDto(AdminFixture.createAdminFixture());
  });

  describe('loginId', () => {
    it('ID의 길이가 6 이상, 255 이하가 아니라면 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = 'test';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('ID의 길이가 6 이상, 255 이하가 아니라면 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = 'a'.repeat(256);

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('ID에 null이 입력되면 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('password', () => {
    it('패스워드의 길이가 6 이상, 60 이하가 아니라면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'test';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('패스워드에 특수문자가 하나 이상 없다면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'testAdminPassword';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('패스워드에 null이 입력되면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });
});
