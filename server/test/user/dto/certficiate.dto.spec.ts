import { validate } from 'class-validator';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';

describe('CertificateDto Test', () => {
  let dto: CertificateUserRequestDto;

  beforeEach(() => {
    dto = new CertificateUserRequestDto({ uuid: 'test' });
  });

  describe('uuid', () => {
    it('uuid가 비어있으면 유효성 검사에 실패한다.', async () => {
      // given
      dto.uuid = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).not.toHaveLength(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
