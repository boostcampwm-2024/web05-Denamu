import { validate } from 'class-validator';
import { DeleteCertificateRssRequestDto } from '@src/rss/dto/request/deleteCertificateRss.dto';

describe(`${DeleteCertificateRssRequestDto.name} Test`, () => {
  let dto: DeleteCertificateRssRequestDto;

  beforeEach(() => {
    dto = new DeleteCertificateRssRequestDto({
      code: 'test',
    });
  });

  it('삭제 인증 코드가 문자열일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('code', () => {
    it('삭제 인증 코드가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.code = 1234 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('삭제 인증 코드가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.code = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('삭제 인증 코드가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.code = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
