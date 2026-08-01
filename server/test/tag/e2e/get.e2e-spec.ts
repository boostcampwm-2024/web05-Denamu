import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ReadTagResponseDto } from '@tag/dto/response/readTag.dto';
import { Category } from '@tag/entity/category.entity';
import { Tag } from '@tag/entity/tag.entity';
import { CategoryRepository } from '@tag/repository/category.repository';
import { TagRepository } from '@tag/repository/tag.repository';

import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/tags';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let categoryRepository: CategoryRepository;
  let tagRepository: TagRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    categoryRepository = testApp.get(CategoryRepository);
    tagRepository = testApp.get(TagRepository);
  });

  const seedCategory = (name: string, displayOrder: number) => {
    const category = new Category();
    return categoryRepository.save(Object.assign(category, { name, displayOrder }));
  };

  const seedTag = (name: string, category: Category) => {
    const tag = new Tag();
    return tagRepository.save(Object.assign(tag, { name, category }));
  };

  it('[200] 카테고리 display_order 순으로 태그 목록을 그룹핑하여 조회한다.', async () => {
    // given
    const frontend = await seedCategory('FrontEnd', 1);
    const backend = await seedCategory('BackEnd', 2);
    await seedTag('Frontend', frontend);
    await seedTag('React', frontend);
    await seedTag('Backend', backend);

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: ReadTagResponseDto[] } = response.body;
    expect(data).toStrictEqual([
      { category: 'FrontEnd', tags: ['Frontend', 'React'] },
      { category: 'BackEnd', tags: ['Backend'] },
    ]);
  });

  it('[200] 카테고리가 없으면 빈 배열을 반환한다.', async () => {
    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: ReadTagResponseDto[] } = response.body;
    expect(data).toStrictEqual([]);
  });
});
