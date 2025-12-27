import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import * as supertest from 'supertest';

export class E2EHelper {
  public readonly app: INestApplication;
  public readonly agent: TestAgent;

  constructor() {
    this.app = global.app;
    this.agent = supertest(this.app.getHttpServer());
  }
}
