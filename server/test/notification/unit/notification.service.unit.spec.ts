import { NotFoundException } from '@nestjs/common';

import { NotificationRepository } from '@notification/repository/notification.repository';
import { NotificationService } from '@notification/service/notification.service';

describe(`${NotificationService.name} Unit Test`, () => {
  let notificationService: NotificationService;
  let notificationRepository: jest.Mocked<
    Pick<
      NotificationRepository,
      | 'upsertLike'
      | 'deleteLikeNotification'
      | 'upsertComment'
      | 'deleteCommentNotification'
      | 'hasActiveOtherComment'
      | 'upsertSubscribe'
      | 'deleteSubscribeNotification'
      | 'countUnread'
      | 'findByRecipient'
      | 'markRead'
      | 'deleteExpired'
    >
  >;

  beforeEach(() => {
    notificationRepository = {
      upsertLike: jest.fn(),
      deleteLikeNotification: jest.fn(),
      upsertComment: jest.fn(),
      deleteCommentNotification: jest.fn(),
      hasActiveOtherComment: jest.fn(),
      upsertSubscribe: jest.fn(),
      deleteSubscribeNotification: jest.fn(),
      countUnread: jest.fn(),
      findByRecipient: jest.fn(),
      markRead: jest.fn(),
      deleteExpired: jest.fn(),
    };

    notificationService = new NotificationService(
      notificationRepository as unknown as NotificationRepository,
    );
  });

  describe('upsertLikeNotification', () => {
    it('recipientId, feedId로 upsertLike를 호출한다.', async () => {
      // when
      await notificationService.upsertLikeNotification(1, 10);

      // then
      expect(notificationRepository.upsertLike).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('removeLikeNotificationIfEmpty', () => {
    it('좋아요가 남아있으면(likeCount > 0) 알림을 삭제하지 않는다.', async () => {
      // when
      await notificationService.removeLikeNotificationIfEmpty(10, 1);

      // then
      expect(
        notificationRepository.deleteLikeNotification,
      ).not.toHaveBeenCalled();
    });

    it('좋아요가 0개면 해당 게시글의 알림을 삭제한다.', async () => {
      // when
      await notificationService.removeLikeNotificationIfEmpty(10, 0);

      // then
      expect(
        notificationRepository.deleteLikeNotification,
      ).toHaveBeenCalledWith(10);
    });
  });

  describe('upsertCommentNotification', () => {
    it('recipientId, feedId로 upsertComment를 호출한다.', async () => {
      // when
      await notificationService.upsertCommentNotification(1, 10);

      // then
      expect(notificationRepository.upsertComment).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('removeCommentNotificationIfEmpty', () => {
    it('본인 제외 활성 댓글이 남아있으면 알림을 삭제하지 않는다.', async () => {
      // given
      notificationRepository.hasActiveOtherComment.mockResolvedValue(true);

      // when
      await notificationService.removeCommentNotificationIfEmpty(10, 1);

      // then
      expect(notificationRepository.hasActiveOtherComment).toHaveBeenCalledWith(
        10,
        1,
      );
      expect(
        notificationRepository.deleteCommentNotification,
      ).not.toHaveBeenCalled();
    });

    it('본인 제외 활성 댓글이 없으면 해당 게시글의 알림을 삭제한다.', async () => {
      // given
      notificationRepository.hasActiveOtherComment.mockResolvedValue(false);

      // when
      await notificationService.removeCommentNotificationIfEmpty(10, 1);

      // then
      expect(
        notificationRepository.deleteCommentNotification,
      ).toHaveBeenCalledWith(10);
    });
  });

  describe('upsertSubscribeNotification', () => {
    it('recipientId, rssAcceptId로 upsertSubscribe를 호출한다.', async () => {
      // when
      await notificationService.upsertSubscribeNotification(1, 10);

      // then
      expect(notificationRepository.upsertSubscribe).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('removeSubscribeNotificationIfEmpty', () => {
    it('구독자가 남아있으면(subscriberCount > 0) 알림을 삭제하지 않는다.', async () => {
      // when
      await notificationService.removeSubscribeNotificationIfEmpty(10, 1);

      // then
      expect(notificationRepository.deleteSubscribeNotification).not.toHaveBeenCalled();
    });

    it('구독자가 0명이면 해당 RSS의 알림을 삭제한다.', async () => {
      // when
      await notificationService.removeSubscribeNotificationIfEmpty(10, 0);

      // then
      expect(notificationRepository.deleteSubscribeNotification).toHaveBeenCalledWith(10);
    });
  });

  describe('markAsRead', () => {
    it('본인 소유가 아니거나 존재하지 않는 알림이면 NotFoundException을 던진다.', async () => {
      // given
      notificationRepository.markRead.mockResolvedValue(false);

      // when & then
      await expect(notificationService.markAsRead(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('본인 소유 알림이면 읽음 처리를 성공한다.', async () => {
      // given
      notificationRepository.markRead.mockResolvedValue(true);

      // when & then
      await expect(
        notificationService.markAsRead(1, 2),
      ).resolves.toBeUndefined();
      expect(notificationRepository.markRead).toHaveBeenCalledWith(1, 2);
    });
  });
});
