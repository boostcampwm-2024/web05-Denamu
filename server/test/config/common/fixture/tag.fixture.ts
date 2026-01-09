import { Tag } from '@src/tag/entity/tag.entity';
import * as uuid from 'uuid';

export class TagFixture {
  static createGeneralUser() {
    return {
      name: `test${uuid.v4()}`,
    };
  }

  static createTagFixture(overwrites: Partial<Tag> = {}): Tag {
    const tag = new Tag();
    return Object.assign(tag, this.createGeneralUser(), overwrites);
  }
}
