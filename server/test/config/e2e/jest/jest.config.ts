import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

import tsconfig from '../../../../tsconfig.json';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '../../../../',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: {
    'node_modules/(htmlparser2|entities|domelementtype|domhandler|domutils|dom-serializer)/.+\\.js$':
      ['ts-jest', { tsconfig: { allowJs: true } }],
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!htmlparser2/|entities/|domelementtype/|domhandler/|domutils/|dom-serializer/)',
  ],
  coverageDirectory: './coverage/e2e',
  setupFilesAfterEnv: ['./test/config/e2e/env/jest.setup.ts'],
  globalSetup: './test/config/e2e/global/e2e-test-global-setup.ts',
  globalTeardown: './test/config/e2e/global/e2e-test-global-teardown.ts',
  maxWorkers: '50%',
  testTimeout: 20000,
  testPathIgnorePatterns: ['test/sample/'],
  coveragePathIgnorePatterns: ['test/', 'src/common/database/migration'],
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions?.paths ?? {},
    { prefix: '<rootDir>/' },
  ),
};

export default config;
