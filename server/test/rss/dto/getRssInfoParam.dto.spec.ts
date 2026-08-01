import { validate } from 'class-validator';

import { GetRssInfoParamRequestDto } from '@rss/dto/request/getRssInfoParam.dto';

describe(`${GetRssInfoParamRequestDto.name} Test`, () => {
  let dto: GetRssInfoParamRequestDto;

  beforeEach(() => {
    dto = new GetRssInfoParamRequestDto({
      rssId: 1,
    });
  });

  it('rssId가 1 이상의 정수일 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('rssId', () => {
    it('rssId가 정수가 아니고 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssId = 'abc' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('rssId가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssId = 0;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });
});
