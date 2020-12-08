import { memoryStorageProvider } from './src/provider/memory-storage.provider';
import { planetRouterTestSuite } from './tests/e2e/planet';
import { robotRouterTestSuite } from './tests/e2e/robot';

describe('sequentially run tests', () => {
    afterAll(() => {
        // memoryStorageProvider.closeClient();
    });

    planetRouterTestSuite();
    robotRouterTestSuite();
})