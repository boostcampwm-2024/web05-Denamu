import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';
import { UserService } from '../../user/service/user.service';
import { ActivityService } from '../../activity/service/activity.service';
import { Payload } from '../../common/guard/jwt.guard';

@Injectable()
export class ReadFeedInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    let user: Payload | null;

    if (token) {
      try {
        user = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
        });
        request.user = user;
      } catch (error) {
        request.user = null;
      }
    } else {
      request.user = null;
    }

    return next.handle().pipe(
      tap(async () => {
        if (user) {
          await this.handleLoggedInUserActivity(request, user);
        }
      }),
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async handleLoggedInUserActivity(request: Request, user: Payload) {
    const feedId = Number(request.params['feedId']);
    if (!feedId) return;

    const hasUserFlag = await this.redisService.sismember(
      `feed:${feedId}:userId`,
      user.id,
    );

    if (!hasUserFlag) {
      console.log(user.id + 'user id 발견요');
      await this.redisService.sadd(`feed:${feedId}:userId`, user.id);
      this.userService.updateUserActivity(user.id);
      await this.activityService.upsertActivity(user.id);
    }
  }
}
