import { TagRepository } from '@tag/repository/tag.repository';

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [TagRepository],
  exports: [TagRepository],
})
export class TagModule {}
