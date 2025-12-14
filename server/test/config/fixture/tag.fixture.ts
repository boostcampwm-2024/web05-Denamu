import { Tag } from '../../../src/tag/entity/tag.entity';

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
