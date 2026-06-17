import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: '../../../../',
  projects: [
    '<rootDir>/test/config/dto/jest/jest.config.ts',
    '<rootDir>/test/config/unit/jest/jest.config.ts',
    '<rootDir>/test/config/e2e/jest/jest.config.ts',
  ],
  maxWorkers: '50%',
  testTimeout: 20000,
  coverageDirectory: './coverage/integration',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  coveragePathIgnorePatterns: ['test', 'src/common/database/migration'],
};

export default config;
