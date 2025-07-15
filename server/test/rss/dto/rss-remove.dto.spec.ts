import { validate } from 'class-validator';
import { RequestDeleteRssDto } from '../../../src/rss/dto/request/rss-request-delete.dto';

describe('RequestDeleteRssDto Test', () => {
  let dto: RequestDeleteRssDto;

  beforeEach(() => {
    dto = new RequestDeleteRssDto({
      blogUrl: 'https://test.com/rss',
      userName: 'test',
      email: 'test@test.com',
    });
  });

  it('블로그 주소가 없다.', async () => {
    // given
    delete dto.blogUrl;

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

  it('사용자 이름이 없다.', async () => {
    // given
    delete dto.userName;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      '유저 이름은 반드시 입력해야 합니다.',
    );
  });
  it('사용자 이름이 문자열이 아니다.', async () => {
    // given
    dto.userName = 100 as any;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      '문자열로 입력해주세요.',
    );
  });
  it('이메일 주소가 없다.', async () => {
    // given
    delete dto.email;

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
