import { Module } from '@nestjs/common';
import { TagRepository } from '../repository/tag.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [TagRepository],
  exports: [],
})
export class TagModule {}
