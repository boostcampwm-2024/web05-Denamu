import { AdminRepository } from '../../../../../src/admin/repository/admin.repository';
import { REDIS_KEYS } from '../../../../../src/common/redis/redis.constant';
import { RedisService } from '../../../../../src/common/redis/redis.service';
import { E2EHelper } from '../e2e-helper';

export class AdminE2EHelper extends E2EHelper {
  public readonly adminRepository: AdminRepository;
  public readonly redisService: RedisService;

  constructor() {
    super();
    this.adminRepository = this.app.get(AdminRepository);
    this.redisService = this.app.get(RedisService);
  }

  public getRedisKey(data: string) {
    return `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  }
}
