import { validate } from 'class-validator';
import { RejectRssRequestDto } from '../../../src/rss/dto/request/rejectRss';

describe('RejectRssRequestDto Test', () => {
  let dto: RejectRssRequestDto;

  beforeEach(() => {
    dto = new RejectRssRequestDto({
      description: 'test',
    });
  });

  it('거절 사유가 문자열일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('description', () => {
    it('거절 사유가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.description = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('거절 사유가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.description = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('거절 사유가 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.description = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
