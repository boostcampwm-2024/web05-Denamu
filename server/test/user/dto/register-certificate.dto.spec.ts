import { validate } from 'class-validator';
import { CertificateUserRequestDto } from '@user/dto/request/certificateUser.dto';

describe(`${CertificateUserRequestDto.name} Test`, () => {
  let dto: CertificateUserRequestDto;

  beforeEach(() => {
    dto = new CertificateUserRequestDto({ uuid: 'test' });
  });

  it('인증 코드가 유효할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('uuid', () => {
    it('인증 코드가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('인증 코드가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
