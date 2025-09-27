module.exports = {
  displayName: 'backend',
  testEnvironment: 'node',
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