import 'reflect-metadata';
import { validate } from 'class-validator';
import { ManageRssRequestDto } from '../../../src/rss/dto/request/manageRss.dto';

describe('RssManagementDto Test', () => {
  let dto: ManageRssRequestDto;

  beforeEach(() => {
    dto = new ManageRssRequestDto({
      id: 1,
    });
  });

  describe('id', () => {
    it('Rss관리 API의 PathVariable이 정수가 아닐 경우', async () => {
      // given
      dto.id = 'abc' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty(
        'isInt',
        '정수를 입력해주세요.',
      );
    });
  });
});
