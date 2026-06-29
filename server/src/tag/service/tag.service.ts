import { Injectable } from '@nestjs/common';

import { ReadTagResponseDto } from '@tag/dto/response/readTag.dto';
import { CategoryRepository } from '@tag/repository/category.repository';

@Injectable()
export class TagService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async readTags() {
    const categories = await this.categoryRepository.findAllWithTags();
    return ReadTagResponseDto.toResponseDtoArray(categories);
  }
}
