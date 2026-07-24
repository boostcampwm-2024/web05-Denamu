import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { GetCommentResponseDto } from '@comment/dto/response/getComment.dto';
import { GetUserCommentsResponseDto } from '@comment/dto/response/getUserComments.dto';
import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';
import { CommentService } from '@comment/service/comment.service';

import { Payload } from '@common/guard/jwt.guard';

import { FeedService } from '@feed/service/feed.service';

import { UserService } from '@user/service/user.service';

describe(`${CommentService.name} Unit Test`, () => {
  let commentService: CommentService;
  let commentRepository: jest.Mocked<
    Pick<
      CommentRepository,
      | 'findOne'
      | 'getCommentInformation'
      | 'getCommentsByUser'
      | 'save'
      | 'count'
    >
  >;
  let feedService: jest.Mocked<Pick<FeedService, 'getPublicFeed'>>;
  let userService: jest.Mocked<Pick<UserService, 'getUser'>>;
  let manager: { save: jest.Mock; remove: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  const user: Payload = {
    id: 1,
    email: 'user@test.com',
    userName: 'tester',
    role: 'user',
  };

  beforeEach(() => {
    commentRepository = {
      findOne: jest.fn(),
      getCommentInformation: jest.fn(),
      getCommentsByUser: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    feedService = { getPublicFeed: jest.fn() };
    userService = { getUser: jest.fn() };
    manager = { save: jest.fn(), remove: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;

    commentService = new CommentService(
      commentRepository as unknown as CommentRepository,
      dataSource as unknown as DataSource,
      feedService as unknown as FeedService,
      userService as unknown as UserService,
    );
  });

  describe('get', () => {
    it('피드 존재를 확인하고 댓글 목록을 응답으로 변환한다.', async () => {
      // given
      const dto = { feedId: 10 };
      const comments = [
        {
          id: 1,
          comment: 'c',
          date: new Date('2025-01-01'),
          user: { id: 1, userName: 'tester', profileImage: null },
        },
      ] as Comment[];
      feedService.getPublicFeed.mockResolvedValue({
        id: 10,
        isPublic: true,
      } as any);
      commentRepository.getCommentInformation.mockResolvedValue(comments);

      // when
      const result = await commentService.get(dto);

      // then
      expect(feedService.getPublicFeed).toHaveBeenCalledWith(10);
      expect(commentRepository.getCommentInformation).toHaveBeenCalledWith(
        10,
        undefined,
      );
      expect(result).toEqual(
        GetCommentResponseDto.toResponseDtoArray(comments),
      );
    });
  });

  describe('getCommentsByUser', () => {
    const makeComment = (id: number) =>
      ({
        id,
        comment: `c${id}`,
        date: new Date('2025-01-01'),
        feed: { id, title: `t${id}`, path: `https://example.com/${id}` },
      }) as Comment;

    it('존재하지 않는 유저면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        commentService.getCommentsByUser(999, { limit: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(commentRepository.getCommentsByUser).not.toHaveBeenCalled();
    });

    it('limit+1개가 조회되면 마지막 항목을 잘라내고 hasMore=true로 응답한다.', async () => {
      // given
      const dto = { lastId: undefined, limit: 2 };
      const rows = [makeComment(5), makeComment(4), makeComment(3)];
      userService.getUser.mockResolvedValue({ id: 1 } as any);
      commentRepository.getCommentsByUser.mockResolvedValue(rows);

      // when
      const result = await commentService.getCommentsByUser(1, dto);

      // then
      expect(userService.getUser).toHaveBeenCalledWith(1);
      expect(commentRepository.getCommentsByUser).toHaveBeenCalledWith(
        1,
        undefined,
        2,
      );
      expect(result).toEqual(
        GetUserCommentsResponseDto.toResponseDto(
          [makeComment(5), makeComment(4)],
          4,
          true,
        ),
      );
    });

    it('마지막 페이지면 hasMore=false, lastId는 마지막 댓글 ID로 응답한다.', async () => {
      // given
      const dto = { lastId: 6, limit: 2 };
      const rows = [makeComment(5), makeComment(4)];
      userService.getUser.mockResolvedValue({ id: 1 } as any);
      commentRepository.getCommentsByUser.mockResolvedValue(rows);

      // when
      const result = await commentService.getCommentsByUser(1, dto);

      // then
      expect(result.hasMore).toBe(false);
      expect(result.lastId).toBe(4);
      expect(result.result).toHaveLength(2);
    });

    it('댓글이 없으면 빈 목록과 lastId=0으로 응답한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 1 } as any);
      commentRepository.getCommentsByUser.mockResolvedValue([]);

      // when
      const result = await commentService.getCommentsByUser(1, { limit: 10 });

      // then
      expect(result.result).toEqual([]);
      expect(result.lastId).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('create', () => {
    it('트랜잭션 안에서 댓글 수를 증가시키고 댓글을 저장한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 2, isPublic: true };
      feedService.getPublicFeed.mockResolvedValue(feed as any);
      const dto = { comment: '새 댓글' };

      // when
      await commentService.create(user, 10, dto);

      // then
      expect(feed.commentCount).toBe(3);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.save).toHaveBeenCalledWith(Comment, {
        comment: '새 댓글',
        feed,
        user: { id: user.id },
        parentId: null,
      });
    });

    it('비공개 게시글이면 NotFoundException을 던지고 저장하지 않는다.', async () => {
      // given - getPublicFeed가 비공개 게시글에 대해 404를 던진다.
      feedService.getPublicFeed.mockRejectedValue(
        new NotFoundException('존재하지 않는 게시글입니다.'),
      );

      // when & then
      await expect(
        commentService.create(user, 10, { comment: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('유효한 부모 댓글이 있으면 parentId를 포함해 답글을 저장한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 2, isPublic: true };
      feedService.getPublicFeed.mockResolvedValue(feed as any);
      commentRepository.findOne.mockResolvedValue({
        id: 7,
        parentId: null,
        feed: { id: 10 },
      } as any);

      // when
      await commentService.create(user, 10, { comment: '답글', parentId: 7 });

      // then
      expect(feed.commentCount).toBe(3);
      expect(manager.save).toHaveBeenCalledWith(Comment, {
        comment: '답글',
        feed,
        user: { id: user.id },
        parentId: 7,
      });
    });

    it('존재하지 않는 부모 댓글이면 NotFoundException을 던지고 저장하지 않는다.', async () => {
      // given
      feedService.getPublicFeed.mockResolvedValue({
        id: 10,
        commentCount: 2,
        isPublic: true,
      } as any);
      commentRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        commentService.create(user, 10, { comment: '답글', parentId: 999 }),
      ).rejects.toThrow(NotFoundException);
      expect(manager.save).not.toHaveBeenCalledWith(Comment, expect.anything());
    });

    it('부모 댓글이 다른 게시글에 속하면 BadRequestException을 던진다.', async () => {
      // given
      feedService.getPublicFeed.mockResolvedValue({
        id: 10,
        commentCount: 2,
        isPublic: true,
      } as any);
      commentRepository.findOne.mockResolvedValue({
        id: 7,
        parentId: null,
        feed: { id: 99 },
      } as any);

      // when & then
      await expect(
        commentService.create(user, 10, { comment: '답글', parentId: 7 }),
      ).rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalledWith(Comment, expect.anything());
    });

    it('부모 댓글이 이미 답글이면(2단계 초과) BadRequestException을 던진다.', async () => {
      // given
      feedService.getPublicFeed.mockResolvedValue({
        id: 10,
        commentCount: 2,
        isPublic: true,
      } as any);
      commentRepository.findOne.mockResolvedValue({
        id: 7,
        parentId: 3,
        feed: { id: 10 },
      } as any);

      // when & then
      await expect(
        commentService.create(user, 10, { comment: '답답글', parentId: 7 }),
      ).rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalledWith(Comment, expect.anything());
    });
  });

  describe('delete', () => {
    const dto = { commentId: 5 };

    it('존재하지 않는 댓글이면 NotFoundException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(commentService.delete(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('본인 댓글도 아니고 RSS 소유자도 아니면 ForbiddenException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 5,
        user: { id: 999 },
        feed: { id: 10, commentCount: 3, blog: { userId: 888 } },
      } as any);

      // when & then
      await expect(commentService.delete(user, dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(manager.remove).not.toHaveBeenCalled();
    });

    it('본인 댓글이면 댓글 수를 감소시키고 댓글을 제거한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 3, blog: { userId: 888 } };
      const comment = {
        id: 5,
        parentId: null,
        user: { id: user.id },
        feed,
      } as any;
      commentRepository.findOne.mockResolvedValue(comment);
      commentRepository.count.mockResolvedValue(0);

      // when
      await commentService.delete(user, dto);

      // then
      expect(feed.commentCount).toBe(2);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.remove).toHaveBeenCalledWith(comment);
    });

    it('답글이 달린 최상위 댓글은 soft delete 처리하고 commentCount를 유지한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 3, blog: { userId: 888 } };
      const comment = {
        id: 5,
        parentId: null,
        isDeleted: false,
        user: { id: user.id },
        feed,
      } as Comment;
      commentRepository.findOne.mockResolvedValue(comment);
      commentRepository.count.mockResolvedValue(2);

      // when
      await commentService.delete(user, dto);

      // then
      expect(comment.isDeleted).toBe(true);
      expect(feed.commentCount).toBe(3);
      expect(manager.save).toHaveBeenCalledWith(comment);
      expect(manager.remove).not.toHaveBeenCalled();
    });

    it('답글(parentId 존재)은 replyCount 조회 없이 hard delete 한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 3, blog: { userId: 888 } };
      const comment = {
        id: 5,
        parentId: 1,
        user: { id: user.id },
        feed,
      } as Comment;
      commentRepository.findOne.mockResolvedValue(comment);

      // when
      await commentService.delete(user, dto);

      // then
      expect(commentRepository.count).not.toHaveBeenCalled();
      expect(feed.commentCount).toBe(2);
      expect(manager.remove).toHaveBeenCalledWith(comment);
    });

    it('본인 댓글이 아니어도 RSS 소유자면 댓글 수를 감소시키고 댓글을 제거한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 3, blog: { userId: user.id } };
      const comment = { id: 5, user: { id: 999 }, feed } as Comment;
      commentRepository.findOne.mockResolvedValue(comment);

      // when
      await commentService.delete(user, dto);

      // then
      expect(feed.commentCount).toBe(2);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.remove).toHaveBeenCalledWith(comment);
    });
  });

  describe('deleteByAdmin', () => {
    it('존재하지 않는 댓글이면 NotFoundException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(commentService.deleteByAdmin(5)).rejects.toThrow(
        NotFoundException,
      );
      expect(commentRepository.save).not.toHaveBeenCalled();
    });

    it('권한·답글·commentCount 분기 없이 isDeleted와 isAdminDeleted를 true로 저장한다.', async () => {
      // given
      const comment = {
        id: 5,
        isDeleted: false,
        isAdminDeleted: false,
      } as Comment;
      commentRepository.findOne.mockResolvedValue(comment);

      // when
      await commentService.deleteByAdmin(5);

      // then
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(comment.isDeleted).toBe(true);
      expect(comment.isAdminDeleted).toBe(true);
      expect(commentRepository.save).toHaveBeenCalledWith(comment);
      expect(commentRepository.count).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('GetCommentResponseDto placeholder', () => {
    const baseComment = {
      id: 5,
      parentId: null,
      date: new Date('2025-01-01'),
      comment: '원본 내용',
      user: { id: 1, userName: 'tester', profileImage: null },
    };

    it('관리자가 삭제한 댓글은 "관리자에 의해 제거된 댓글입니다." placeholder로 변환한다.', () => {
      // given
      const comment = {
        ...baseComment,
        isDeleted: true,
        isAdminDeleted: true,
      } as Comment;

      // when
      const dto = GetCommentResponseDto.toResponseDto(comment);

      // then
      expect(dto.comment).toBe('관리자에 의해 제거된 댓글입니다.');
      expect(dto.isDeleted).toBe(true);
      expect(dto.user).toEqual({
        id: 0,
        userName: '(알 수 없음)',
        profileImage: null,
      });
    });

    it('일반 soft delete 댓글은 "삭제된 댓글입니다." placeholder로 변환한다.', () => {
      // given
      const comment = {
        ...baseComment,
        isDeleted: true,
        isAdminDeleted: false,
      } as Comment;

      // when
      const dto = GetCommentResponseDto.toResponseDto(comment);

      // then
      expect(dto.comment).toBe('삭제된 댓글입니다.');
    });

    it('삭제되지 않은 댓글은 원본 내용을 그대로 노출한다.', () => {
      // given
      const comment = {
        ...baseComment,
        isDeleted: false,
        isAdminDeleted: false,
      } as Comment;

      // when
      const dto = GetCommentResponseDto.toResponseDto(comment);

      // then
      expect(dto.comment).toBe('원본 내용');
    });
  });

  describe('update', () => {
    it('본인 댓글의 내용을 수정하고 저장한다.', async () => {
      // given
      const comment = {
        id: 5,
        comment: '이전',
        user: { id: user.id },
        feed: { id: 10 },
      } as Comment;
      commentRepository.findOne.mockResolvedValue(comment);
      const dto = { newComment: '수정됨' };

      // when
      await commentService.update(user, 5, dto);

      // then
      expect(comment.comment).toBe('수정됨');
      expect(commentRepository.save).toHaveBeenCalledWith(comment);
    });

    it('본인 댓글이 아니면 ForbiddenException을 던지고 저장하지 않는다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 5,
        user: { id: 999 },
        feed: { id: 10 },
      } as any);

      // when & then
      await expect(
        commentService.update(user, 5, {
          newComment: '수정됨',
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(commentRepository.save).not.toHaveBeenCalled();
    });

    it('이미 삭제된 댓글이면 NotFoundException을 던지고 저장하지 않는다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 5,
        isDeleted: true,
        comment: '삭제됨',
        user: { id: user.id },
        feed: { id: 10 },
      } as any);

      // when & then
      await expect(
        commentService.update(user, 5, { newComment: '수정됨' }),
      ).rejects.toThrow(NotFoundException);
      expect(commentRepository.save).not.toHaveBeenCalled();
    });
  });
});
