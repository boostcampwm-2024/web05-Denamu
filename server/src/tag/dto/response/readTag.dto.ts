import { ApiProperty } from '@nestjs/swagger';

import { Category } from '@tag/entity/category.entity';

export class ReadTagResponseDto {
  @ApiProperty({
    example: 'FrontEnd',
    description: '카테고리 이름',
  })
  category: string;

  @ApiProperty({
    example: ['Frontend', 'React', 'TypeScript'],
    description: '카테고리에 속한 태그 목록',
    type: [String],
  })
  tags: string[];

  constructor(partial: Partial<ReadTagResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(category: Category) {
    return new ReadTagResponseDto({
      category: category.name,
      tags: category.tags.map((tag) => tag.name),
    });
  }

  static toResponseDtoArray(categories: Category[]) {
    return categories.map((category) => this.toResponseDto(category));
  }
}
