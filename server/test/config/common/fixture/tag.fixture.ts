import * as uuid from 'uuid';

import { Tag } from '@tag/entity/tag.entity';

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
