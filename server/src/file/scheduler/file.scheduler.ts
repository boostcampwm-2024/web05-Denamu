import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BoardRepository } from '@board/repository/board.repository';
import { extractBoardImageUrls } from '@board/util/extractBoardImageUrls';
import { IsNull, Not } from 'typeorm';

import { WinstonLoggerService } from '@common/logger/logger.service';

import {
  FileUploadType,
  ORPHAN_FILE_GRACE_PERIOD_MS,
} from '@file/constant/file.constant';
import { FileRepository } from '@file/repository/file.repository';
import { FileService } from '@file/service/file.service';
import { canonicalizeUrl } from '@file/util/canonicalizeUrl';

import { UserRepository } from '@user/repository/user.repository';

@Injectable()
export class FileScheduler {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly userRepository: UserRepository,
    private readonly boardRepository: BoardRepository,
    private readonly fileService: FileService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOrphanFiles(): Promise<void> {
    await this.cleanupOrphanProfileImages();
    await this.cleanupOrphanBoardImages();
  }

  private async cleanupOrphanProfileImages(): Promise<void> {
    const cutoff = new Date(Date.now() - ORPHAN_FILE_GRACE_PERIOD_MS);

    try {
      const candidates = await this.fileRepository.findOldByUploadType(
        FileUploadType.PROFILE_IMAGE,
        cutoff,
      );
      if (candidates.length === 0) {
        return;
      }

      const totalUserCount = await this.userRepository.count();
      if (totalUserCount === 0) {
        this.logger.warn(
          '[FileScheduler]: 유저 조회 결과가 비정상적으로 비어 있어 정리를 중단합니다.',
        );
        return;
      }

      const users = await this.userRepository.find({
        where: { profileImage: Not(IsNull()) },
        select: ['profileImage'],
      });
      const referenced = new Set(
        users.map((user) => canonicalizeUrl(user.profileImage)),
      );

      let deletedCount = 0;
      for (const candidate of candidates) {
        const accessUrl = this.fileService.toAccessUrl(candidate.path);
        if (referenced.has(canonicalizeUrl(accessUrl))) {
          continue;
        }
        try {
          await this.fileService.deleteByPath(accessUrl);
          deletedCount += 1;
        } catch (error) {
          this.logger.error(
            `[FileScheduler]: 프로필 고아 이미지 삭제 실패: ${accessUrl}, error=${error}`,
          );
        }
      }
      this.logger.log(
        `[FileScheduler]: 프로필 고아 이미지 ${deletedCount}개 삭제 완료.`,
      );
    } catch (error) {
      this.logger.error(
        `[FileScheduler]: 프로필 고아 이미지 정리 중 오류 발생: ${error}`,
      );
    }
  }

  private async cleanupOrphanBoardImages(): Promise<void> {
    const cutoff = Date.now() - ORPHAN_FILE_GRACE_PERIOD_MS;

    try {
      const candidates = await this.fileService.findOldBoardImagePaths(cutoff);
      if (candidates.length === 0) {
        return;
      }

      const boards = await this.boardRepository.find({
        select: ['content'],
      });

      if (boards.length === 0) {
        this.logger.warn(
          '[FileScheduler]: 게시글 조회 결과가 비정상적으로 비어 있어 정리를 중단합니다.',
        );
        return;
      }

      const referenced = new Set(
        boards.flatMap((board) =>
          extractBoardImageUrls(board.content).map(canonicalizeUrl),
        ),
      );

      let deletedCount = 0;
      for (const internalPath of candidates) {
        const accessUrl = this.fileService.toAccessUrl(internalPath);
        if (referenced.has(canonicalizeUrl(accessUrl))) {
          continue;
        }
        try {
          await this.fileService.deleteUntracked(accessUrl);
          deletedCount += 1;
        } catch (error) {
          this.logger.error(
            `[FileScheduler]: 게시글 고아 이미지 삭제 실패: ${accessUrl}, error=${error}`,
          );
        }
      }
      this.logger.log(
        `[FileScheduler]: 게시글 고아 이미지 ${deletedCount}개 삭제 완료.`,
      );
    } catch (error) {
      this.logger.error(
        `[FileScheduler]: 게시글 고아 이미지 정리 중 오류 발생: ${error}`,
      );
    }
  }
}
