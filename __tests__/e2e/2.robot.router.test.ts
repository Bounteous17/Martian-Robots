// Environment
import { environment as originalEnvironment } from '../../environment/environment';

// Modules
import supertest, { SuperTest, Test } from 'supertest';
import { mocked } from "ts-jest/utils";
import { Server } from 'http';

// Mocking environment
jest.mock('../../environment/environment');
const environment = mocked(originalEnvironment, true);
environment.api.autoListen = false;

// Providers
import { memoryStorageProvider } from '../../src/provider/memory-storage.provider';
import { app } from '../../app';

describe('robot.router', () => {
    let server: Server;
    let request: SuperTest<Test>;

    beforeAll(() => {
        server = app.listen(environment.api.port);
        request = supertest(app);
    });

    afterAll(() => {
        server.close();
        memoryStorageProvider.closeClient();
    });

    describe('should not fail', () => {
        it('create planet', async () => {
            const { body, status } = await request
                .post('/planet')
                .send({
                    name: 'Jest',
                    dimensions: {
                        x: 7,
                        y: 5
                    }
                });

            expect(status).toBe(200);
            expect(body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(body.dimensions).toEqual({
                x: 7,
                y: 5
            });
            expect(body.name).toBe('Jest');
            expect(await memoryStorageProvider.get(body.id)).toBeTruthy();
            expect(await memoryStorageProvider.get('jestId')).toBeFalsy();
        });
    });

});