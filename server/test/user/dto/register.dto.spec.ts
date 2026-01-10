import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';

import { validate } from 'class-validator';

describe(`${RegisterUserRequestDto.name} Test`, () => {
  let dto: RegisterUserRequestDto;

  beforeEach(() => {
    dto = new RegisterUserRequestDto({
      email: 'test@test.com',
      password: 'test1234!',
      userName: 'test',
    });
  });

  it('회원가입하고자 하는 유저 정보가 적합할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('이메일 주소가 유효하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'invalid-email';
      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일 주소가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일 주소가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('password', () => {
    it('비밀번호가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('비밀번호가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('비밀번호가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('비밀번호 길이가 8보다 짧을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 'a'.repeat(7);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('비밀번호 길이가 32보다 길 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 'a'.repeat(33);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('비밀번호에 영문, 숫자, 특수문자 중 2종류 이상 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 'a'.repeat(30);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('userName', () => {
    it('사용자 이름이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('사용자 이름이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('사용자 이름이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
