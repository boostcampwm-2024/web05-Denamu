import * as uuid from 'uuid';

export class ChatFixture {
  static createChat(overwrites = {}) {
    return {
      messageId: '123',
      userId: uuid.v4(),
      message: 'Hello, World!',
      ...overwrites,
    };
  }

  static createChatHistory(count = 1) {
    return Array.from({ length: count }, (_, i) => ({
      username: `testUser${i + 1}`,
      message: `Message ${i + 1}`,
      timestamp: new Date().toISOString(),
    }));
  }
}
