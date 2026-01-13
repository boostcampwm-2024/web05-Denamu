import { validate } from 'class-validator';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';

describe(`${RegisterRssRequestDto.name} Test`, () => {
  let dto: RegisterRssRequestDto;

  beforeEach(() => {
    dto = new RegisterRssRequestDto({
      blog: 'test',
      name: 'test',
      email: 'test@test.com',
      rssUrl: 'https://test.com',
    });
  });

  it('RSS 신청 정보가 모두 유효할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('blog', () => {
    it('블로그 이름이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blog = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('블로그 이름이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.blog = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('블로그 이름이 문자열이 아니고 정수일 경우 유효성 검사에 실패한다.', async () => {
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

  describe('rssUrl', () => {
    it('RSS 주소가 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssUrl = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('RSS 주소가 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssUrl = '';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('RSS 주소가 유효하지 않을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.rssUrl = 'http://test';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('RSS 주소가 HTTP, HTTPS 프로토콜이 아닐 경우 유효성 검사에 실패한다.', async () => {
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
