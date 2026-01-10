import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from '../../../../tsconfig.json';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '../../../..',
  testRegex: 'test/.*\\.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage/e2e',
  setupFilesAfterEnv: ['./test/config/e2e/env/jest.setup.ts'],
  globalSetup: './test/config/e2e/global/jest.global-setup.ts',
  globalTeardown: './test/config/e2e/global/jest.global-teardown.ts',
  maxWorkers: 1,
  testTimeout: 20000,
  testPathIgnorePatterns: ['test/sample/'],
  coveragePathIgnorePatterns: ['test'],
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths ?? {},
    { prefix: '<rootDir>/' },
  ),
};

export default config;
