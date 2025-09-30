import { validate } from 'class-validator';
import { DeleteRssRequestDto } from '../../../src/rss/dto/request/deleteRss.dto';

describe('DeleteRssRequestDto Test', () => {
  let dto: DeleteRssRequestDto;

  beforeEach(() => {
    dto = new DeleteRssRequestDto({
      blogUrl: 'https://test.com/rss',
      email: 'test@test.com',
    });
  });

  it('블로그 주소와 이메일이 모두 유효할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('blogUrl', () => {
    it('블로그 주소가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogUrl = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('블로그 주소가 유효하지 않은 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogUrl = 'just string';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });
  });

  describe('email', () => {
    it('이메일 주소가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일 주소가 유효하지 않은 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'just string';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });
});
