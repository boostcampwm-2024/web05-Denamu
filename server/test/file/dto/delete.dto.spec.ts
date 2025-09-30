import { validate } from 'class-validator';
import { DeleteFileRequestDto } from '../../../src/file/dto/request/deleteFile.dto';

describe('DeleteFileRequestDto Test', () => {
  let dto: DeleteFileRequestDto;

  beforeEach(() => {
    dto = new DeleteFileRequestDto({ id: 1 });
  });

  it('id가 정수이고 1 이상일 경우 테스트를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('id', () => {
    it('id가 비어있으면 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('id가 1보다 작을 경우 유효성 검사에 실패한다.', async () => {
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
