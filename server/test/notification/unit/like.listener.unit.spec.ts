import { WinstonLoggerService } from '@common/logger/logger.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { LikeCreatedEvent } from '@like/event/like-created.event';
import { LikeDeletedEvent } from '@like/event/like-deleted.event';

import { LikeListener } from '@notification/listener/like.listener';
import { NotificationService } from '@notification/service/notification.service';

describe(`${LikeListener.name} Unit Test`, () => {
  let likeListener: LikeListener;
  let feedRepository: jest.Mocked<
    Pick<FeedRepository, 'getBlogMetaByFeedId' | 'findOneBy'>
  >;
  let notificationService: jest.Mocked<
    Pick<
      NotificationService,
      'upsertLikeNotification' | 'removeLikeNotificationIfEmpty'
    >
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;

  beforeEach(() => {
    feedRepository = { getBlogMetaByFeedId: jest.fn(), findOneBy: jest.fn() };
    notificationService = {
      upsertLikeNotification: jest.fn(),
      removeLikeNotificationIfEmpty: jest.fn(),
    };
    logger = { error: jest.fn() };

    likeListener = new LikeListener(
      feedRepository as unknown as FeedRepository,
      notificationService as unknown as NotificationService,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('handleLikeCreated', () => {
    it('게시글 소유자가 없으면(RSS 미소유) 알림을 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        owner: null,
      });

      // when
      await likeListener.handleLikeCreated(new LikeCreatedEvent(10, 2));

      // then
      expect(notificationService.upsertLikeNotification).not.toHaveBeenCalled();
    });

    it('본인 게시글에 본인이 좋아요를 누르면(self-like) 알림을 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        owner: { id: 2, userName: 'blog-owner', profileImage: null },
      });

      // when
      await likeListener.handleLikeCreated(new LikeCreatedEvent(10, 2));

      // then
      expect(notificationService.upsertLikeNotification).not.toHaveBeenCalled();
    });

    it('타인이 좋아요를 누르면 게시글 소유자에게 알림을 upsert한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        owner: { id: 99, userName: 'blog-owner', profileImage: null },
      });

      // when
      await likeListener.handleLikeCreated(new LikeCreatedEvent(10, 2));

      // then
      expect(notificationService.upsertLikeNotification).toHaveBeenCalledWith(
        99,
        10,
      );
    });

    it('처리 중 예외가 발생해도 던지지 않고 로깅한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockRejectedValue(
        new Error('db down'),
      );

      // when & then
      await expect(
        likeListener.handleLikeCreated(new LikeCreatedEvent(10, 2)),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('handleLikeDeleted', () => {
    it('게시글이 존재하지 않으면 아무 것도 하지 않는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue(null);

      // when
      await likeListener.handleLikeDeleted(new LikeDeletedEvent(10, 2));

      // then
      expect(
        notificationService.removeLikeNotificationIfEmpty,
      ).not.toHaveBeenCalled();
    });

    it('게시글의 현재 좋아요 수 기준으로 알림 삭제 여부를 위임한다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({
        id: 10,
        likeCount: 0,
      } as any);

      // when
      await likeListener.handleLikeDeleted(new LikeDeletedEvent(10, 2));

      // then
      expect(
        notificationService.removeLikeNotificationIfEmpty,
      ).toHaveBeenCalledWith(10, 0);
    });
  });
});
