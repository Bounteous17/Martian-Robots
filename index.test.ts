// Environment
import { environment as originalEnvironment } from './environment/environment';

// Modules
import { mocked } from "ts-jest/utils";

// Mocking environment
jest.mock('./environment/environment');
const environment = mocked(originalEnvironment, true);
environment.api.autoListen = false;

import { memoryStorageProvider } from './src/provider/memory-storage.provider';
import { planetRouterTestSuite } from './tests/e2e/planet';
import { robotRouterTestSuite } from './tests/e2e/robot';

describe('sequentially run tests', () => {
    afterAll(() => {
        memoryStorageProvider.closeClient();
    });

    planetRouterTestSuite();
    robotRouterTestSuite();
})