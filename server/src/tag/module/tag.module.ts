import { Module } from '@nestjs/common';

import { TagController } from '@tag/controller/tag.controller';
import { CategoryRepository } from '@tag/repository/category.repository';
import { TagRepository } from '@tag/repository/tag.repository';
import { TagService } from '@tag/service/tag.service';

@Module({
  imports: [],
  controllers: [TagController],
  providers: [TagService, TagRepository, CategoryRepository],
  exports: [],
})
export class TagModule {}
