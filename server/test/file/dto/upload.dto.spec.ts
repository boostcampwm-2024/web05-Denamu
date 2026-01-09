import { validate } from 'class-validator';
import { UploadFileQueryRequestDto } from '@file/dto/request/uploadFile.dto';
import { FileUploadType } from '@file/constant/file.constant';

describe('UploadFileQueryRequestDto Test', () => {
  let dto: UploadFileQueryRequestDto;

  beforeEach(() => {
    dto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });
  });

  it('파일 타입이 타입 목록에 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('uploadType', () => {
    it('파일 타입이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('파일 타입이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('파일 타입이 타입 목록에 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
