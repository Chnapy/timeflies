import { applySetupTests } from '@timeflies/devtools';

applySetupTests();

globalThis.localStorage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    key: jest.fn(() => null),
    length: 0
};
