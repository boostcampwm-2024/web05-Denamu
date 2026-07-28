import { CommentCreatedEvent } from '@comment/event/comment-created.event';
import { CommentDeletedEvent } from '@comment/event/comment-deleted.event';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { CommentListener } from '@notification/listener/comment.listener';
import { NotificationService } from '@notification/service/notification.service';

describe(`${CommentListener.name} Unit Test`, () => {
  let commentListener: CommentListener;
  let feedRepository: jest.Mocked<Pick<FeedRepository, 'getBlogMetaByFeedId'>>;
  let notificationService: jest.Mocked<
    Pick<
      NotificationService,
      | 'upsertCommentNotification'
      | 'removeCommentNotificationIfEmpty'
      | 'upsertReplyNotification'
      | 'removeReplyNotificationIfEmpty'
    >
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;

  beforeEach(() => {
    feedRepository = { getBlogMetaByFeedId: jest.fn() };
    notificationService = {
      upsertCommentNotification: jest.fn(),
      removeCommentNotificationIfEmpty: jest.fn(),
      upsertReplyNotification: jest.fn(),
      removeReplyNotificationIfEmpty: jest.fn(),
    };
    logger = { error: jest.fn() };

    commentListener = new CommentListener(
      feedRepository as unknown as FeedRepository,
      notificationService as unknown as NotificationService,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('handleCommentCreated', () => {
    it('게시글 소유자가 없으면(RSS 미소유) 알림을 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: null,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, null),
      );

      // then
      expect(
        notificationService.upsertCommentNotification,
      ).not.toHaveBeenCalled();
    });

    it('본인 게시글에 본인이 댓글을 달면(self-comment) 알림을 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 2,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, null),
      );

      // then
      expect(
        notificationService.upsertCommentNotification,
      ).not.toHaveBeenCalled();
    });

    it('타인이 댓글을 달면 게시글 소유자에게 알림을 upsert한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, null),
      );

      // then
      expect(
        notificationService.upsertCommentNotification,
      ).toHaveBeenCalledWith(99, 10);
    });

    it('처리 중 예외가 발생해도 던지지 않고 로깅한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockRejectedValue(
        new Error('db down'),
      );

      // when & then
      await expect(
        commentListener.handleCommentCreated(new CommentCreatedEvent(10, 2, null)),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });

    it('부모 댓글이 없으면(top-level 댓글) 답글 알림을 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, null),
      );

      // then
      expect(
        notificationService.upsertReplyNotification,
      ).not.toHaveBeenCalled();
    });

    it('본인 댓글에 본인이 답글을 달면(self-reply) 답글 알림을 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, 2),
      );

      // then
      expect(
        notificationService.upsertReplyNotification,
      ).not.toHaveBeenCalled();
    });

    it('타인이 답글을 달면 원본 댓글 작성자에게 답글 알림을 upsert한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, 5),
      );

      // then
      expect(
        notificationService.upsertReplyNotification,
      ).toHaveBeenCalledWith(5, 10);
    });

    it('내 게시글의 내 댓글에 답글이 달리면 답글 알림만 생성하고 댓글 알림은 생성하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentCreated(
        new CommentCreatedEvent(10, 2, 99),
      );

      // then
      expect(notificationService.upsertReplyNotification).toHaveBeenCalledWith(
        99,
        10,
      );
      expect(
        notificationService.upsertCommentNotification,
      ).not.toHaveBeenCalled();
    });

    it('답글 알림 생성 중 예외가 발생해도 던지지 않고 로깅한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });
      notificationService.upsertReplyNotification.mockRejectedValue(
        new Error('db down'),
      );

      // when & then
      await expect(
        commentListener.handleCommentCreated(
          new CommentCreatedEvent(10, 2, 5),
        ),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('handleCommentDeleted', () => {
    it('게시글 소유자가 없으면(RSS 미소유) 아무 것도 하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: null,
      });

      // when
      await commentListener.handleCommentDeleted(new CommentDeletedEvent(10, null));

      // then
      expect(
        notificationService.removeCommentNotificationIfEmpty,
      ).not.toHaveBeenCalled();
    });

    it('게시글 소유자 기준으로 남은 활성 댓글 여부를 위임한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentDeleted(new CommentDeletedEvent(10, null));

      // then
      expect(
        notificationService.removeCommentNotificationIfEmpty,
      ).toHaveBeenCalledWith(10, 99);
    });

    it('처리 중 예외가 발생해도 던지지 않고 로깅한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockRejectedValue(
        new Error('db down'),
      );

      // when & then
      await expect(
        commentListener.handleCommentDeleted(new CommentDeletedEvent(10, null)),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });

    it('삭제된 댓글이 top-level이면(parentAuthorId 없음) 답글 알림 삭제를 위임하지 않는다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentDeleted(
        new CommentDeletedEvent(10, null),
      );

      // then
      expect(
        notificationService.removeReplyNotificationIfEmpty,
      ).not.toHaveBeenCalled();
    });

    it('삭제된 댓글이 답글이면 원본 댓글 작성자 기준으로 남은 활성 답글 여부를 위임한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });

      // when
      await commentListener.handleCommentDeleted(
        new CommentDeletedEvent(10, 5),
      );

      // then
      expect(
        notificationService.removeReplyNotificationIfEmpty,
      ).toHaveBeenCalledWith(10, 5);
    });

    it('답글 알림 삭제 중 예외가 발생해도 던지지 않고 로깅한다.', async () => {
      // given
      feedRepository.getBlogMetaByFeedId.mockResolvedValue({
        id: 1,
        userName: 'blog',
        userId: 99,
      });
      notificationService.removeReplyNotificationIfEmpty.mockRejectedValue(
        new Error('db down'),
      );

      // when & then
      await expect(
        commentListener.handleCommentDeleted(
          new CommentDeletedEvent(10, 5),
        ),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
