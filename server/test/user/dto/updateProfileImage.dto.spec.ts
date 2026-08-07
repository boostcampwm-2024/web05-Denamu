import { validate } from 'class-validator';

import { UpdateProfileImageRequestDto } from '@user/dto/request/updateProfileImage.dto';

describe(`${UpdateProfileImageRequestDto.name} Test`, () => {
  let dto: UpdateProfileImageRequestDto;

  beforeEach(() => {
    dto = new UpdateProfileImageRequestDto();
    dto.profileImage = 'test';
  });

  it('프로필 이미지 경로가 문자열이면 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

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
