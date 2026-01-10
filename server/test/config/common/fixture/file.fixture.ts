import * as uuid from 'uuid';

import { File } from '@file/entity/file.entity';

export class FileFixture {
  static createGeneralFile() {
    return {
      originalName: 'test.png',
      mimetype: 'image/png',
      path: `https://test.com/${uuid.v4()}.png`,
      size: 1024,
      createdAt: new Date('2025-11-22'),
    };
  }

  static createFileFixture(overwrites: Partial<File> = {}) {
    const file = new File();
    return Object.assign(file, this.createGeneralFile(), overwrites);
  }
}
