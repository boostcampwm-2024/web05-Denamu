import { AdminFixture } from '../../fixture/admin.fixture';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/registerAdmin.dto';
import { validate } from 'class-validator';

describe('RegisterAdminRequestDto Test', () => {
  let dto: RegisterAdminRequestDto;

  beforeEach(() => {
    dto = new RegisterAdminRequestDto(AdminFixture.createAdminFixture());
  });

  it('ID와 패스워드가 올바르게 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('loginId', () => {
    it('ID의 길이가 6 이상이 아니라면 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = 'test';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('ID의 길이가 255 이하가 아니라면 유효성 검사에 실패한다.', async () => {
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
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('ID에 빈 문자열이 입력되면 유효성 검사에 실패한다.', async () => {
      //given
      dto.loginId = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('ID에 문자열이 아닌 값이 입력되면 유효성 검사에 실패한다.', async () => {
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
    it('패스워드의 길이가 6 이상이 아니라면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'a'.repeat(5);

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('패스워드의 길이가 6 이상, 60 이하가 아니라면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'a'.repeat(61);

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
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('패스워드에 빈 문자열이 입력되면 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
