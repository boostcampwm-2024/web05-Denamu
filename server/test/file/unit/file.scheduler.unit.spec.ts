import { BoardRepository } from '@board/repository/board.repository';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { FileRepository } from '@file/repository/file.repository';
import { FileScheduler } from '@file/scheduler/file.scheduler';
import { FileService } from '@file/service/file.service';

import { UserRepository } from '@user/repository/user.repository';

import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { FileFixture } from '@test/config/common/fixture/file.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';

describe(`${FileScheduler.name} Unit Test`, () => {
  let fileScheduler: FileScheduler;
  let fileRepository: jest.Mocked<Pick<FileRepository, 'findOldByUploadType'>>;
  let userRepository: jest.Mocked<Pick<UserRepository, 'count' | 'find'>>;
  let boardRepository: jest.Mocked<Pick<BoardRepository, 'find'>>;
  let fileService: jest.Mocked<
    Pick<
      FileService,
      | 'findOldBoardImagePaths'
      | 'toAccessUrl'
      | 'deleteByPath'
      | 'deleteUntracked'
    >
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'log' | 'warn' | 'error'>>;

  beforeEach(() => {
    fileRepository = { findOldByUploadType: jest.fn().mockResolvedValue([]) };
    userRepository = {
      count: jest.fn(),
      find: jest.fn(),
    };
    boardRepository = { find: jest.fn() };
    fileService = {
      findOldBoardImagePaths: jest.fn().mockResolvedValue([]),
      toAccessUrl: jest.fn((p: string) => p),
      deleteByPath: jest.fn(),
      deleteUntracked: jest.fn(),
    };
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

    fileScheduler = new FileScheduler(
      fileRepository as unknown as FileRepository,
      userRepository as unknown as UserRepository,
      boardRepository as unknown as BoardRepository,
      fileService as unknown as FileService,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('cleanupOrphanProfileImages', () => {
    it('오래된 후보가 없으면 유저 조회 없이 종료한다.', async () => {
      // given
      fileRepository.findOldByUploadType.mockResolvedValue([]);

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(userRepository.count).not.toHaveBeenCalled();
    });

    it('유저 전체 조회 결과가 비어 있으면 정리를 중단한다.', async () => {
      // given
      fileRepository.findOldByUploadType.mockResolvedValue([
        FileFixture.createFileFixture({ path: '/app/objects/a.png' }),
      ]);
      userRepository.count.mockResolvedValue(0);

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(userRepository.find).not.toHaveBeenCalled();
      expect(fileService.deleteByPath).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('참조되지 않는 후보만 삭제하고, 참조되는 후보는 남긴다.', async () => {
      // given
      fileRepository.findOldByUploadType.mockResolvedValue([
        FileFixture.createFileFixture({
          path: '/objects/PROFILE_IMAGE/used.png',
        }),
        FileFixture.createFileFixture({
          path: '/objects/PROFILE_IMAGE/unused.png',
        }),
      ]);
      userRepository.count.mockResolvedValue(1);
      userRepository.find.mockResolvedValue([
        UserFixture.createUserFixture({
          profileImage: '/objects/PROFILE_IMAGE/used.png',
        }),
      ]);

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(fileService.deleteByPath).toHaveBeenCalledTimes(1);
      expect(fileService.deleteByPath).toHaveBeenCalledWith(
        '/objects/PROFILE_IMAGE/unused.png',
      );
    });

    it('삭제 중 오류가 발생해도 나머지 후보를 계속 처리한다.', async () => {
      // given
      fileRepository.findOldByUploadType.mockResolvedValue([
        FileFixture.createFileFixture({ path: '/objects/PROFILE_IMAGE/a.png' }),
        FileFixture.createFileFixture({ path: '/objects/PROFILE_IMAGE/b.png' }),
      ]);
      userRepository.count.mockResolvedValue(1);
      userRepository.find.mockResolvedValue([]);
      fileService.deleteByPath.mockRejectedValueOnce(
        new Error('unlink failed'),
      );

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(fileService.deleteByPath).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalled();
    });

    it('조회 중 예외가 발생하면 잡아서 에러로 남기고 전파하지 않는다.', async () => {
      // given
      fileRepository.findOldByUploadType.mockRejectedValue(
        new Error('DB down'),
      );

      // when & then
      await expect(fileScheduler.cleanupOrphanFiles()).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('cleanupOrphanBoardImages', () => {
    it('오래된 후보가 없으면 게시글 조회 없이 종료한다.', async () => {
      // given
      fileService.findOldBoardImagePaths.mockResolvedValue([]);

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(boardRepository.find).not.toHaveBeenCalled();
    });

    it('게시글 조회 결과가 비어 있으면 정리를 중단한다.', async () => {
      // given
      fileService.findOldBoardImagePaths.mockResolvedValue([
        '/app/objects/BOARD_IMAGE/2026-08-01/a.png',
      ]);
      boardRepository.find.mockResolvedValue([]);

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(fileService.deleteUntracked).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('본문에 참조되지 않는 후보만 삭제한다.', async () => {
      // given
      fileService.findOldBoardImagePaths.mockResolvedValue([
        '/objects/BOARD_IMAGE/used.png',
        '/objects/BOARD_IMAGE/unused.png',
      ]);
      boardRepository.find.mockResolvedValue([
        BoardFixture.createBoardFixture({
          content: '<p><img src="/objects/BOARD_IMAGE/used.png"></p>',
        }),
      ]);

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(fileService.deleteUntracked).toHaveBeenCalledTimes(1);
      expect(fileService.deleteUntracked).toHaveBeenCalledWith(
        '/objects/BOARD_IMAGE/unused.png',
      );
    });

    it('삭제 중 오류가 발생해도 나머지 후보를 계속 처리한다.', async () => {
      // given
      fileService.findOldBoardImagePaths.mockResolvedValue([
        '/objects/BOARD_IMAGE/a.png',
        '/objects/BOARD_IMAGE/b.png',
      ]);
      boardRepository.find.mockResolvedValue([
        BoardFixture.createBoardFixture({ content: '<p>no images</p>' }),
      ]);
      fileService.deleteUntracked.mockRejectedValueOnce(
        new Error('unlink failed'),
      );

      // when
      await fileScheduler.cleanupOrphanFiles();

      // then
      expect(fileService.deleteUntracked).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalled();
    });

    it('조회 중 예외가 발생하면 잡아서 에러로 남기고 전파하지 않는다.', async () => {
      // given
      fileService.findOldBoardImagePaths.mockRejectedValue(
        new Error('disk error'),
      );

      // when & then
      await expect(fileScheduler.cleanupOrphanFiles()).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
