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

  it('blog 경로와 이메일 경로가 올바를 경우 유효성 검사를 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('blogUrl', () => {
    it('블로그 주소가 없다.', async () => {
      // given
      dto.blogUrl = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('블로그 주소가 올바르지 않다.', async () => {
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
    it('이메일 주소가 없다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일 주소가 올바르지 않다.', async () => {
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
