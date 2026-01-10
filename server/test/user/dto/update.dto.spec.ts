import { validate } from 'class-validator';

import { UpdateUserRequestDto } from '@user/dto/request/updateUser.dto';

describe(`${UpdateUserRequestDto.name} Test`, () => {
  let dto: UpdateUserRequestDto;

  beforeEach(() => {
    dto = new UpdateUserRequestDto({
      userName: 'test',
      profileImage: 'test',
      introduction: 'test',
    });
  });

  it('업데이트 정보가 유효할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('일부 필드만 수정할 경우 유효성 검사에 성공한다.', async () => {
    // given
    dto.userName = '부분수정';

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('빈 객체일 경우 유효성 검사에 성공한다.', async () => {
    // given
    const dto = new UpdateUserRequestDto({});

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('userName', () => {
    it('유저 이름이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.userName = 123 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('유저 이름의 길이가 60보다 길 경우 유효성 검사에 실패한다.', async () => {
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
    it('프로필 이미지 경로가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
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
    it('소개 글이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.introduction = 123 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('소개 글의 길이가 500을 초과하는 정수일 경우 유효성 검사에 실패한다.', async () => {
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
    it('여러 필드가 유효하지 않을 경우 여러 유효성 검사에 실패한다.', async () => {
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
