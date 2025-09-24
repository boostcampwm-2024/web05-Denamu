import { validate } from 'class-validator';
import { UpdateUserRequestDto } from '../../../src/user/dto/request/updateUser.dto';

describe('UpdateUserRequestDto Test', () => {
  let dto: UpdateUserRequestDto;

  beforeEach(() => {
    dto = new UpdateUserRequestDto({
      userName: 'test',
      profileImage: 'test',
      introduction: 'test',
    });
  });

  it('정상적인 데이터로 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('일부 필드만 있어도 유효성 검사를 통과한다.', async () => {
    // given
    dto.userName = '부분수정';

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

  describe('userName', () => {
    it('userName이 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = 123 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('userName이 60자를 초과하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = 'a'.repeat(61);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('profileImage', () => {
    it('profileImage가 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.profileImage = 123 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('introduction', () => {
    it('introduction이 문자열이 아니면 유효성 검사에 실패한다.', async () => {
      // given
      dto.introduction = 123 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('introduction이 500자를 초과하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.introduction = 'a'.repeat(501);

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
      dto.userName = 123 as any;
      dto.profileImage = 456 as any;
      dto.introduction = 789 as any;

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
