module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: './test/tsconfig.json',
    },
  },
  rootDir: '../..',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  verbose: false,
  /**
   * restoreMocks [boolean]
   *
   * Default: false
   *
   * Automatically restore mock state between every test.
   * Equivalent to calling jest.restoreAllMocks() between each test.
   * This will lead to any mocks having their fake implementations removed
   * and restores their initial implementation.
   */
  restoreMocks: true,
  /**
   * resetModules [boolean]
   *
   * Default: false
   *
   * By default, each test file gets its own independent module registry.
   * Enabling resetModules goes a step further and resets the module registry before running each individual test.
   * This is useful to isolate modules for every test so that local module state doesn't conflict between tests.
   * This can be done programmatically using jest.resetModules().
   */
  resetModules: true,
  testMatch: ['<rootDir>/test/unit/**/*.(spec|test).(js|ts)'],
  coverageDirectory: '../../.coverage/unit',
  collectCoverageFrom: ['src/**'],
  collectCoverage: true,
  coverageReporters: [
    [
      'json',
      {
        file: 'dappauth-unit-coverage.json',
      },
    ],
  ],
};
