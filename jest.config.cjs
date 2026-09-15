module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/test/mocks/styleMock.cjs",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/test/mocks/fileMock.cjs",
  },
};
