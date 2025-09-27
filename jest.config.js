module.exports = {
  projects: [
    '<rootDir>/jest.frontend.config.js',
    '<rootDir>/backend/jest.config.js',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/e2e/'
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/backend/node_modules/'
  ],
};