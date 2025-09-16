// Jest configuration extracted from package.json, adapted for CJS + selective ESM dependencies
/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'test-config',
    'src/app/auth',
    'src/app/email',
    'jestGlobalMocks.ts',
    '\\.module\\.ts',
    'src/main.ts',
    '\\.mock\\.ts',
    '/infraestructure/',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/$1',
  },
  // Allow transformation of ESM packages that don't provide CJS versions
  transformIgnorePatterns: ['node_modules/(?!(@noble|better-auth|@thallesp/nestjs-better-auth|jose)/)'],
};
