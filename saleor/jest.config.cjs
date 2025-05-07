// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',          // alias de jest-environment-jsdom
  moduleFileExtensions: ['js','jsx','json'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: ['<rootDir>/src/**/*.test.(js|jsx)']
};
