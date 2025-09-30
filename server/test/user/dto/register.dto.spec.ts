import { validate } from 'class-validator';
import { RegisterUserRequestDto } from '../../../src/user/dto/request/registerUser.dto';

describe('RegisterUserRequestDto Test', () => {
  let dto: RegisterUserRequestDto;

  beforeEach(() => {
    dto = new RegisterUserRequestDto({
      email: 'test@test.com',
      password: 'test1234!',
      userName: 'test',
    });
  });

  it('회원가입 유저 정보가 올바를 경우 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('잘못된 이메일 형식이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'invalid-email';
      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
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
    it('비밀번호가 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('비밀번호가 빈 문자열이면 유효성 검사에 실패한다.', async () => {
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

    it('비밀번호 길이가 8자리보다 적을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.password = 'a'.repeat(7);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('비밀번호 길이가 32자리보다 적을 경우 유효성 검사에 실패한다.', async () => {
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
    it('사용자 이름이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('사용자 이름이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('사용자 이름이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
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
