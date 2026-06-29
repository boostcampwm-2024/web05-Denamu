import { validate } from 'class-validator';

import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';

describe(`${RegisterAdminRequestDto.name} Test`, () => {
  let dto: RegisterAdminRequestDto;

  beforeEach(() => {
    dto = new RegisterAdminRequestDto(AdminFixture.createAdminFixture());
  });

  it('ID와 패스워드가 정책에 부합할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('password', () => {
    it('패스워드 길이가 6 미만일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'a'.repeat(5);

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('패스워드 길이가 61 초과일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'a'.repeat(61);

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('패스워드에 특수문자가 하나 이상 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.password = 'testAdminPassword';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

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
  });

  describe('name', () => {
    it('이름의 길이가 255 초과일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.name = 'a'.repeat(256);

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('이름이 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.name = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('이름이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.name = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('이름이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.name = 1 as any;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('email', () => {
    it('이메일 형식이 아닐 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.email = 'not-an-email';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.email = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });
});
