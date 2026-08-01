import { validate } from 'class-validator';

import { CheckUserNameDuplicationRequestDto } from '@user/dto/request/checkUserNameDuplication.dto';

describe(`${CheckUserNameDuplicationRequestDto.name} Test`, () => {
  let dto: CheckUserNameDuplicationRequestDto;

  beforeEach(() => {
    dto = new CheckUserNameDuplicationRequestDto({ userName: '홍길동' });
  });

  it('사용자 이름이 문자열이고 60자 이하면 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('사용자 이름이 빈 문자열이면 유효성 검사에 실패한다.', async () => {
    // given
    dto.userName = '';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('사용자 이름이 60자를 초과하면 유효성 검사에 실패한다.', async () => {
    // given
    dto.userName = 'a'.repeat(61);

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });
});
