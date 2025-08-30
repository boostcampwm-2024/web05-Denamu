import { validate } from 'class-validator';
import { UpdateUserRequestDto } from '../../../src/user/dto/request/updateUser.dto';

describe('UpdateUserDto Test', () => {
  it('정상적인 데이터로 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new UpdateUserRequestDto({
      userName: '정상이름',
      profileImage: 'profile-uuid-123',
      introduction: '안녕하세요! 정상적인 소개글입니다.',
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('일부 필드만 있어도 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new UpdateUserRequestDto({
      userName: '부분수정',
    });

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('빈 객체도 유효성 검사를 통과한다.', async () => {
    // given
    const dto = new UpdateUserRequestDto({});

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('userName 유효성 검사', () => {
    it('userName이 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      const dto = new UpdateUserRequestDto({
        userName: 123 as any,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('userName이 60자를 초과하면 유효성 검사에 실패한다.', async () => {
      // given
      const longUserName = 'a'.repeat(61);
      const dto = new UpdateUserRequestDto({
        userName: longUserName,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('profileImage 유효성 검사', () => {
    it('profileImage가 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      const dto = new UpdateUserRequestDto({
        profileImage: 123 as any,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('profileImage가 정상적인 문자열이면 유효성 검사를 통과한다.', async () => {
      // given
      const dto = new UpdateUserRequestDto({
        profileImage: 'valid-uuid-string',
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });
  });

  describe('introduction 유효성 검사', () => {
    it('introduction이 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      const dto = new UpdateUserRequestDto({
        introduction: 123 as any,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('introduction이 500자를 초과하면 유효성 검사에 실패한다.', async () => {
      // given
      const longIntroduction = 'a'.repeat(501);
      const dto = new UpdateUserRequestDto({
        introduction: longIntroduction,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('복합 필드 유효성 검사', () => {
    it('여러 필드에 유효성 오류가 있으면 모든 오류를 반환한다.', async () => {
      // given
      const dto = new UpdateUserRequestDto({
        userName: 123 as any,
        profileImage: 456 as any,
        introduction: 789 as any,
      });

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(3);

      const constraintTypes = errors.flatMap((error) =>
        Object.keys(error.constraints || {}),
      );
      expect(constraintTypes).toContain('isString');
    });
  });
});
