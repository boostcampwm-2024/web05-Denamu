import { validate } from 'class-validator';

import {
  AdminChatMessageParamDto,
  AdminChatRoomParamDto,
} from '@chat/dto/request/adminChatParam.dto';

describe(`${AdminChatRoomParamDto.name} Test`, () => {
  let dto: AdminChatRoomParamDto;

  beforeEach(() => {
    dto = new AdminChatRoomParamDto();
    dto.roomId = 'anonymous1';
  });

  it('유효한 roomId면 통과한다', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('두 자리 이상 번호도 통과한다', async () => {
    dto.roomId = 'anonymous12';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  describe('roomId', () => {
    it.each(['anonymous', 'anonymous0', 'anonymous01', 'room1', ''])(
      '형식이 맞지 않으면 실패한다: %s',
      async (roomId) => {
        dto.roomId = roomId;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('roomId');
        expect(errors[0].constraints).toHaveProperty('matches');
      },
    );
  });
});

describe(`${AdminChatMessageParamDto.name} Test`, () => {
  let dto: AdminChatMessageParamDto;

  beforeEach(() => {
    dto = new AdminChatMessageParamDto();
    dto.roomId = 'anonymous1';
    dto.messageId = '550e8400-e29b-41d4-a716-446655440000';
  });

  it('모든 값이 유효하면 통과한다', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('roomId', () => {
    it('형식이 맞지 않으면 실패한다', async () => {
      dto.roomId = 'anonymous0';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roomId');
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('messageId', () => {
    it('UUIDv4 형식이 아니면 실패한다', async () => {
      dto.messageId = 'invalid-id';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('messageId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });
});
