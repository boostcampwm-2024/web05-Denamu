import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/health';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
  });

  it('[200] 헬스 체크 요청을 받은 경우 OK 메시지를 응답한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('OK');
    expect(data).toBeUndefined();
  });
});
