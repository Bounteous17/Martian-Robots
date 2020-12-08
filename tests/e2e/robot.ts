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
import { app } from '../../app';

export const robotRouterTestSuite = () => describe('robot.router', () => {
    let server: Server;
    let request: SuperTest<Test>;

    beforeAll(() => {
        server = app.listen(environment.api.port);
        request = supertest(app);
    });

    afterAll(() => {
        server.close();
    });

    describe('should not fail', () => {
        it('robot input 1', async () => {
            const { body, status } = await request
                .post('/robot')
                .send({
                    planetId: process.env.JEST_PLANET_ID,
                    orientation: 'E',
                    coordinates: {
                        x: 1,
                        y: 1
                    },
                    positions: 'RFRFRFRF'
                });

            expect(status).toBe(200);
            expect(body.orientation).toBe('E');
            expect(body.coordinate).toEqual({
                x: 1,
                y: 1
            });
        });

        it('robot input 2', async () => {
            const { body, status } = await request
                .post('/robot')
                .send({
                    planetId: process.env.JEST_PLANET_ID,
                    orientation: 'N',
                    coordinates: {
                        x: 3,
                        y: 2
                    },
                    positions: 'FRRFLLFFRRFLL'
                });

            expect(status).toBe(200);
            expect(body.orientation).toBe('N');
            expect(body.coordinate).toEqual({
                x: 3,
                y: 3
            });
        });

        it('robot input 3', async () => {
            const { body, status } = await request
                .post('/robot')
                .send({
                    planetId: process.env.JEST_PLANET_ID,
                    orientation: 'W',
                    coordinates: {
                        x: 0,
                        y: 3
                    },
                    positions: 'LLFFFLFLFL'
                });

            expect(status).toBe(200);
            expect(body.orientation).toBe('S');
            expect(body.coordinate).toEqual({
                x: 2,
                y: 3
            });
        });
    });

});