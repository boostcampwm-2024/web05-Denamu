import { validate } from 'class-validator';

import { FileUploadType } from '@file/constant/file.constant';
import { UploadAdminImageRequestDto } from '@file/dto/request/uploadAdminImage.dto';

describe(`${UploadAdminImageRequestDto.name} Test`, () => {
  let dto: UploadAdminImageRequestDto;

  beforeEach(() => {
    dto = new UploadAdminImageRequestDto();
    dto.uploadType = FileUploadType.BOARD_IMAGE;
  });

  it('이미지 타입이 관리자 업로드 허용 목록에 있을 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('이미지 타입이 마케팅 이메일 이미지일 경우 유효성 검사에 성공한다.', async () => {
    // given
    dto.uploadType = FileUploadType.MARKETING_EMAIL_IMAGE;

    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('uploadType', () => {
    it('이미지 타입이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('이미지 타입이 프로필 이미지처럼 관리자 업로드 허용 목록에 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = FileUploadType.PROFILE_IMAGE;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('이미지 타입이 타입 목록에 없는 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = 'test' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('이미지 타입이 문자열이 아닌 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.uploadType = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });
  });
});
