import { validate } from 'class-validator';
import { RegisterRssRequestDto } from '../../../src/rss/dto/request/registerRss.dto';

describe('RegisterRssRequestDto Test', () => {
  let dto: RegisterRssRequestDto;

  beforeEach(() => {
    dto = new RegisterRssRequestDto({
      blog: 'test',
      name: 'test',
      email: 'test@test.com',
      rssUrl: 'https://test.com',
    });
  });

  it('RSS 신청 정보가 올바를 경우 유효성 검사를 통과한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('blog', () => {
    it('블로그 이름이 없다.', async () => {
      // given
      dto.blog = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('블로그 이름이 빈 문자열이다.', async () => {
      // given
      dto.blog = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('블로그 이름이 문자열이 아니다.', async () => {
      // given
      dto.blog = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('name', () => {
    it('실명이 없다.', async () => {
      // given
      dto.name = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('실명이 빈 문자열이다.', async () => {
      // given
      dto.name = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('실명이 문자열이 아니다.', async () => {
      // given
      dto.name = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('실명의 길이가 2자리보다 작다.', async () => {
      // given
      dto.name = 'a';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('실명의 길이가 50자리보다 크다.', async () => {
      // given
      dto.name = 'a'.repeat(60);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });
  });

  describe('email', () => {
    it('이메일이 없다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 빈 문자열이다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('이메일 형식이 올바르지 않다.', async () => {
      // given
      dto.email = 'test';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('rssUrl', () => {
    it('RSS URL이 없다.', async () => {
      // given
      dto.rssUrl = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('RSS URL이 빈 문자열이다.', async () => {
      // given
      dto.rssUrl = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('RSS URL 형식이 잘못되었다.', async () => {
      // given
      dto.rssUrl = 'http://test';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('http, https 프로토콜을 제외한 다른 프로토콜을 입력한다.', async () => {
      // given
      dto.rssUrl = 'ftp://test.com';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });
  });
});
