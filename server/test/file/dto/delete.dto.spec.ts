import { validate } from 'class-validator';
import { DeleteFileParamRequestDto } from '../../../src/file/dto/request/deleteFile.dto';

describe('DeleteFileRequestDto Test', () => {
  let dto: DeleteFileParamRequestDto;

  beforeEach(() => {
    dto = new DeleteFileParamRequestDto({ id: 1 });
  });

  it('파일 ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('id', () => {
    it('파일 ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('파일 ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
