<<<<<<<< HEAD:server/test/config/common/fixture/tag.fixture.ts
import { Tag } from '../../../../src/tag/entity/tag.entity';
========
import { Tag } from '../../../src/tag/entity/tag.entity';
>>>>>>>> 69c12e59 (♻️ refactor: test/fixture -\> test/config/fixture):server/test/config/fixture/tag.fixture.ts

export class TagFixture {
  static readonly GENERAL_TAG = {
    name: 'test',
  };

  static createTagFixture(overwrites: Partial<Tag> = {}): Tag {
    const tag = new Tag();
    Object.assign(tag, { ...this.GENERAL_TAG });
    return Object.assign(tag, overwrites);
  }
}
