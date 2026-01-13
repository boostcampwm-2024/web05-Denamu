import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from '../../../../tsconfig.json';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '../../../..',
  testRegex: 'test/.*\\.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage/unit',
  testTimeout: 10000,
  testPathIgnorePatterns: ['test/sample/'],
  coveragePathIgnorePatterns: ['test'],
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths ?? {},
    { prefix: '<rootDir>/' },
  ),
};

export default config;
