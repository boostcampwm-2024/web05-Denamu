import { ChatService } from '../../../../../src/chat/service/chat.service';
import { RedisService } from '../../../../../src/common/redis/redis.service';
import { E2EHelper } from '../e2e-helper';

export class ChatE2EHelper extends E2EHelper {
  public readonly chatService: ChatService;
  public readonly redisService: RedisService;

  constructor() {
    super();
    this.chatService = this.app.get(ChatService);
    this.redisService = this.app.get(RedisService);
  }
}
