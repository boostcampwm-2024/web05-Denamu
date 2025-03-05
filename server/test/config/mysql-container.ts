import { GenericContainer, StartedTestContainer } from 'testcontainers';

export class MySQLTestContainer {
  private container: StartedTestContainer | null = null;

  async start(): Promise<void> {
    this.container = await new GenericContainer('mysql')
      .withExposedPorts(8081)
      .start();
  }

  getHost(): string {
    if (!this.container) throw new Error('컨테이너가 시작되지 않았습니다.');
    return this.container.getHost();
  }

  getPort(): number {
    if (!this.container) throw new Error('컨테이너가 시작되지 않았습니다.');
    return this.container.getMappedPort(8081);
  }

  getUsername(): string {
    return 'root';
  }

  getPassword(): string {
    return 'test';
  }

  getDatabase(): string {
    return 'test_db';
  }

  async stop(): Promise<void> {
    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  }
}
