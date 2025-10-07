module.exports = {
  displayName: 'backend',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  transform: {}, // Needed for ESM support in Jest
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  rootDir: './'
};