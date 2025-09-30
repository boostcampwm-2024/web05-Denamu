import { validate } from 'class-validator';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';

describe('CertificateUserRequestDto Test', () => {
  let dto: CertificateUserRequestDto;

  beforeEach(() => {
    dto = new CertificateUserRequestDto({ uuid: 'test' });
  });

  it('uuid가 문자열일 경우 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('uuid', () => {
    it('uuid가 비어있으면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('uuid가 문자열이 아닐 경우 유효성 검사에 실패한다.', async () => {
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
