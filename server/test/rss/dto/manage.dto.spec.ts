import { validate } from 'class-validator';
import { ManageRssRequestDto } from '../../../src/rss/dto/request/manageRss.dto';

describe(`${ManageRssRequestDto.name} Test`, () => {
  let dto: ManageRssRequestDto;

  beforeEach(() => {
    dto = new ManageRssRequestDto({
      id: 1,
    });
  });

  it('RSS ID가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('id', () => {
    it('RSS ID가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.id = 'abc' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('RSS ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
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
