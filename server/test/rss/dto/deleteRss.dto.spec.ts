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

  describe('blogUrl', () => {
    it('블로그 주소가 없다.', async () => {
      // given
      dto.blogUrl = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors[0].constraints).toHaveProperty(
        'isUrl',
        '유효한 URL을 입력해주세요.',
      );
    });

    it('블로그 주소가 올바르지 않다.', async () => {
      // given
      dto.blogUrl = 'just string';

      // when
      const errors = await validate(dto);

      // then
      expect(errors[0].constraints).toHaveProperty(
        'isUrl',
        '유효한 URL을 입력해주세요.',
      );
    });
  });

  describe('email', () => {
    it('이메일 주소가 없다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors[0].constraints).toHaveProperty(
        'isEmail',
        '올바른 이메일 주소를 입력하세요.',
      );
    });

    it('이메일 주소가 올바르지 않다.', async () => {
      // given
      dto.email = 'just string';

      // when
      const errors = await validate(dto);

      // then
      expect(errors[0].constraints).toHaveProperty(
        'isEmail',
        '올바른 이메일 주소를 입력하세요.',
      );
    });
  });
});
