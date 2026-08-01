import { validate } from 'class-validator';

import { SendMessageDto } from '@chat/dto/sendMessage.dto';

describe(`${SendMessageDto.name} Test`, () => {
  let dto: SendMessageDto;

  beforeEach(() => {
    dto = new SendMessageDto({
      messageId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      message: 'hello world',
    });
  });

  it('모든 값이 유효하면 통과한다', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('messageId', () => {
    it('UUID 형식이 아니면 실패한다', async () => {
      dto.messageId = 'invalid-id';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('messageId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });

  describe('userId', () => {
    it('UUID 형식이 아니면 실패한다', async () => {
      dto.userId = 'invalid-id';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });

  describe('message', () => {
    it('빈 문자열이면 실패한다', async () => {
      dto.message = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('message');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('문자열이 아니면 실패한다', async () => {
      dto.message = 123 as any;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('message');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
