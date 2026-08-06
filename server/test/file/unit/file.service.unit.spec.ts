import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import * as fs from 'fs/promises';
import sharp from 'sharp';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { FileUploadType } from '@file/constant/file.constant';
import { FileRepository } from '@file/repository/file.repository';
import { FileService } from '@file/service/file.service';

import { FileFixture } from '@test/config/common/fixture/file.fixture';

jest.mock('fs/promises');
jest.mock('sharp');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;

describe(`${FileService.name} Unit Test`, () => {
  let fileService: FileService;
  let fileRepository: jest.Mocked<
    Pick<FileRepository, 'save' | 'findOne' | 'delete'>
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'warn'>>;

  beforeEach(() => {
    jest.resetAllMocks();
    fileRepository = { save: jest.fn(), findOne: jest.fn(), delete: jest.fn() };
    logger = { warn: jest.fn() };

    fileService = new FileService(
      fileRepository as unknown as FileRepository,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('handleUpload', () => {
    it('webp 변환 결과가 원본보다 작으면 webp로 재인코딩한 파일을 쓴 뒤 메타데이터를 저장한다.', async () => {
      // given
      const multerFile = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from('original-png-data-longer-than-webp'),
      } as Express.Multer.File;
      const webpBuffer = Buffer.from('webp');
      mockedSharp.mockReturnValue({
        webp: jest.fn().mockReturnValue({
          toBuffer: jest.fn().mockResolvedValue(webpBuffer),
        }),
      } as any);
      const savedFile = FileFixture.createFileFixture({
        id: 1,
        user: { id: 7 } as any,
      });
      fileRepository.save.mockResolvedValue(savedFile);

      // when
      const result = await fileService.handleUpload(
        multerFile,
        FileUploadType.PROFILE_IMAGE,
        7,
      );

      // then
      expect(mockedSharp).toHaveBeenCalledWith(multerFile.buffer, {
        animated: true,
      });
      expect(mockedFs.mkdir).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.webp$/),
        webpBuffer,
      );
      expect(fileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          originalName: 'avatar.png',
          mimetype: 'image/webp',
          size: webpBuffer.length,
          user: { id: 7 },
        }),
      );
      expect(result.id).toBe(savedFile.id);
      expect(result.userId).toBe(7);
      expect(typeof result.url).toBe('string');
    });

    it('이미지 변환에 실패하면 BadRequestException을 던진다.', async () => {
      // given
      const multerFile = {
        originalname: 'broken.png',
        mimetype: 'image/png',
        size: 10,
        buffer: Buffer.from('broken'),
      } as Express.Multer.File;
      mockedSharp.mockReturnValue({
        webp: jest.fn().mockReturnValue({
          toBuffer: jest.fn().mockRejectedValue(new Error('invalid image')),
        }),
      } as any);

      // when & then
      await expect(
        fileService.handleUpload(multerFile, FileUploadType.PROFILE_IMAGE, 7),
      ).rejects.toThrow(BadRequestException);
      expect(fileRepository.save).not.toHaveBeenCalled();
    });

    it('webp 변환 결과가 원본보다 크거나 같으면 원본을 그대로 저장한다.', async () => {
      // given
      const multerFile = {
        originalname: 'tiny.gif',
        mimetype: 'image/gif',
        size: 4,
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      const largerWebpBuffer = Buffer.from('webp-is-bigger-than-original');
      mockedSharp.mockReturnValue({
        webp: jest.fn().mockReturnValue({
          toBuffer: jest.fn().mockResolvedValue(largerWebpBuffer),
        }),
      } as any);
      const savedFile = FileFixture.createFileFixture({
        id: 2,
        user: { id: 7 } as any,
      });
      fileRepository.save.mockResolvedValue(savedFile);

      // when
      await fileService.handleUpload(
        multerFile,
        FileUploadType.PROFILE_IMAGE,
        7,
      );

      // then
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.gif$/),
        multerFile.buffer,
      );
      expect(fileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          originalName: 'tiny.gif',
          mimetype: 'image/gif',
          size: multerFile.buffer.length,
        }),
      );
    });
  });

  describe('findById', () => {
    it('존재하지 않는 파일이면 NotFoundException을 던진다.', async () => {
      // given
      fileRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(fileService.findById(1)).rejects.toThrow(NotFoundException);
    });

    it('존재하는 파일을 반환한다.', async () => {
      // given
      const file = FileFixture.createFileFixture({ id: 1 });
      fileRepository.findOne.mockResolvedValue(file);

      // when
      const result = await fileService.findById(1);

      // then
      expect(result).toBe(file);
    });
  });

  describe('deleteFile', () => {
    it('파일 주인이 아니면 ForbiddenException을 던진다.', async () => {
      // given
      fileRepository.findOne.mockResolvedValue(
        FileFixture.createFileFixture({ id: 1, user: { id: 7 } as any }),
      );

      // when & then
      await expect(fileService.deleteFile(1, 999)).rejects.toThrow(
        ForbiddenException,
      );
      expect(fileRepository.delete).not.toHaveBeenCalled();
    });

    it('파일 주인이면 물리 파일을 지우고 레코드를 삭제한다.', async () => {
      // given
      const file = FileFixture.createFileFixture({
        id: 1,
        path: '/app/objects/a.png',
        user: { id: 7 } as any,
      });
      fileRepository.findOne.mockResolvedValue(file);

      // when
      await fileService.deleteFile(1, 7);

      // then
      expect(mockedFs.access).toHaveBeenCalledWith(file.path);
      expect(mockedFs.unlink).toHaveBeenCalledWith(file.path);
      expect(fileRepository.delete).toHaveBeenCalledWith(1);
    });

    it('물리 파일 삭제에 실패해도 경고만 남기고 레코드는 삭제한다.', async () => {
      // given
      const file = FileFixture.createFileFixture({
        id: 1,
        path: '/app/objects/missing.png',
        user: { id: 7 } as any,
      });
      fileRepository.findOne.mockResolvedValue(file);
      mockedFs.access.mockRejectedValue(new Error('ENOENT'));

      // when
      await fileService.deleteFile(1, 7);

      // then
      expect(logger.warn).toHaveBeenCalled();
      expect(fileRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteByPath', () => {
    it('경로에 해당하는 파일이 없으면 아무 동작도 하지 않는다.', async () => {
      // given
      fileRepository.findOne.mockResolvedValue(null);

      // when
      await fileService.deleteByPath('/app/objects/x.png');

      // then
      expect(mockedFs.unlink).not.toHaveBeenCalled();
      expect(fileRepository.delete).not.toHaveBeenCalled();
    });

    it('파일을 찾으면 물리 파일과 레코드를 삭제한다.', async () => {
      // given
      const file = FileFixture.createFileFixture({
        id: 2,
        path: '/app/objects/y.png',
      });
      fileRepository.findOne.mockResolvedValue(file);

      // when
      await fileService.deleteByPath(file.path);

      // then
      expect(mockedFs.unlink).toHaveBeenCalledWith(file.path);
      expect(fileRepository.delete).toHaveBeenCalledWith(file.id);
    });
  });
});
