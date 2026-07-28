import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

import tsconfig from '../../../../tsconfig.json';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '../../../../',
  testRegex: 'test/.*\\.dto.spec.ts$',
  transform: {
    'node_modules/(htmlparser2|entities|domelementtype|domhandler|domutils|dom-serializer)/.+\\.js$':
      ['ts-jest', { tsconfig: { allowJs: true } }],
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!htmlparser2/|entities/|domelementtype/|domhandler/|domutils/|dom-serializer/)',
  ],
  coverageDirectory: './coverage/dto',
  maxWorkers: '50%',
  testTimeout: 10000,
  testPathIgnorePatterns: ['test/sample/'],
  coveragePathIgnorePatterns: ['test', 'src/common/database/migration'],
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions?.paths ?? {},
    { prefix: '<rootDir>/' },
  ),
};

export default config;
