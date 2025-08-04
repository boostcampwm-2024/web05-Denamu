import { validate } from 'class-validator';
import { DeleteRssDto } from '../../../src/rss/dto/request/rss-delete.dto';

describe('DeleteRssDto Test', () => {
  let dto: DeleteRssDto;
  beforeEach(() => {
    dto = new DeleteRssDto({
      code: 'test',
    });
  });

  it('인증 코드가 문자열이 아니다.', async () => {
    // given
    dto.code = 1234 as any;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      '문자열로 입력해주세요.',
    );
  });
  it('인증 코드가 없다.', async () => {
    // given
    delete dto.code;

    // when
    const errors = await validate(dto);

    // then
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      '인증 코드를 입력해주세요.',
    );
  });
});
