import { validate } from 'class-validator';

import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { BlogPlatform } from '@rss/util/blogUrlToRss';

describe(`${RegisterRssRequestDto.name} Test`, () => {
  let dto: RegisterRssRequestDto;

  beforeEach(() => {
    dto = new RegisterRssRequestDto({
      blogName: 'test',
      name: 'test',
      email: 'test@test.com',
      blogUrl: 'https://test.com',
      blogPlatform: 'etc',
      rssUrl: 'https://test.com/rss',
    });
  });

  it('RSS 신청 정보가 모두 유효할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('blogName', () => {
    it('블로그 이름이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogName = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('블로그 이름이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogName = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('블로그 이름이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogName = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('name', () => {
    it('신청자 이름이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.name = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('신청자 이름이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.name = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('신청자 이름이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.name = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('신청자 이름의 문자열 길이가 2 미만일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.name = 'a'.repeat(1);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('신청자 이름의 문자열 길이가 50 초과일 경우 유효성 검사에 실패한다.', async () => {
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
    it('이메일이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('이메일이 유효하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.email = 'test';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
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

    it('블로그 주소가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogUrl = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('블로그 주소가 유효하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogUrl = 'http://test';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('블로그 주소가 HTTP, HTTPS 프로토콜이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogUrl = 'ftp://test.com';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });
  });

  describe('blogPlatform', () => {
    it('블로그 플랫폼이 허용된 값이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blogPlatform = 'wordpress' as BlogPlatform;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });
  });

  describe('rssUrl', () => {
    it('블로그 플랫폼이 etc이고 RSS 주소가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssUrl = undefined;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('블로그 플랫폼이 etc이고 RSS 주소가 유효하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssUrl = 'invalid-url';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('블로그 플랫폼이 etc가 아니면 RSS 주소가 없어도 유효성 검사를 통과한다.', async () => {
      // given
      dto.blogPlatform = 'tistory';
      dto.rssUrl = undefined;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });
  });
});
