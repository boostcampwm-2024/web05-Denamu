import { File } from '../../src/file/entity/file.entity';

export class FileFixture {
  static readonly GENERAL_FILE = {
    originalName: 'test.png',
    mimetype: 'image/png',
    path: 'https://test.com/test.png',
    size: 1024,
    createdAt: new Date(Date.now()),
  };

  static createFileFixture(overwrites: Partial<File> = {}) {
    const file = new File();
    Object.assign(file, this.GENERAL_FILE);
    return Object.assign(file, overwrites);
  }
}
