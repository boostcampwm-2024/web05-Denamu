import { validate } from 'class-validator';
import { RssRegisterRequestDto } from '../../../src/rss/dto/request/rss-register.dto';

describe('RssRegisterDto Test', () => {
  let dto: RssRegisterRequestDto;

  beforeEach(() => {
    dto = new RssRegisterRequestDto({
      blog: 'test',
      name: 'test',
      email: 'test@test.com',
      rssUrl: 'https://test.com',
    });
  });
  it('블로그 이름이 없다.', async () => {
    // given
    delete dto.blog;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      '문자열로 입력해주세요.',
    );
  });

  it('블로그 이름이 빈 문자열이다.', async () => {
    // given
    dto.blog = '';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      '블로그 이름이 없습니다.',
    );
  });

  it('블로그 이름이 문자열이 아니다.', async () => {
    // given
    dto.blog = 1 as unknown as string;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      '문자열로 입력해주세요.',
    );
  });

  it('실명이 없다.', async () => {
    // given
    delete dto.name;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      '문자열로 입력해주세요.',
    );
  });

  it('실명이 빈 문자열이다.', async () => {
    // given
    dto.name = '';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      '실명이 없습니다.',
    );
  });

  it('실명이 문자열이 아니다.', async () => {
    // given
    dto.name = 1 as unknown as string;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      '문자열로 입력해주세요.',
    );
  });

  it('실명의 길이가 2자리보다 작다.', async () => {
    // given
    dto.name = 'a';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isLength',
      '이름 길이가 올바르지 않습니다.',
    );
  });

  it('실명의 길이가 50자리보다 크다.', async () => {
    // given
    dto.name = 'a'.repeat(60);

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isLength',
      '이름 길이가 올바르지 않습니다.',
    );
  });

  it('이메일이 없다.', async () => {
    // given
    delete dto.email;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isEmail',
      '이메일 주소 형식에 맞춰서 작성해주세요.',
    );
  });

  it('이메일이 빈 문자열이다.', async () => {
    // given
    dto.email = '';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      '이메일이 없습니다.',
    );
  });

  it('이메일 형식이 올바르지 않다.', async () => {
    // given
    dto.email = 'test';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isEmail',
      '이메일 주소 형식에 맞춰서 작성해주세요.',
    );
  });

  it('RSS URL이 없다.', async () => {
    // given
    delete dto.rssUrl;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isUrl',
      'http, https 프로토콜과 URL 형식을 맞춰주세요.',
    );
  });

  it('RSS URL이 빈 문자열이다.', async () => {
    // given
    dto.rssUrl = '';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'RSS URL이 없습니다.',
    );
  });

  it('RSS URL 형식이 잘못되었다.', async () => {
    // given
    dto.rssUrl = 'http://test';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isUrl',
      'http, https 프로토콜과 URL 형식을 맞춰주세요.',
    );
  });

  it('http, https 프로토콜을 제외한 다른 프로토콜을 입력한다.', async () => {
    // given
    dto.rssUrl = 'ftp://test.com';

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isUrl',
      'http, https 프로토콜과 URL 형식을 맞춰주세요.',
    );
  });
});
