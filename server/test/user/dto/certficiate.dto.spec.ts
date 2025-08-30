import { validate } from 'class-validator';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';

describe('CertificateDto Test', () => {
  it('uuid가 비어있으면 유효성 검사에 실패한다.', async () => {
    // given
    const certificateDto = new CertificateUserRequestDto();
    certificateDto.uuid = '';

    // when
    const errors = await validate(certificateDto);

    // then
    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
