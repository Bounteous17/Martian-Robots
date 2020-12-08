// Environment
import { environment } from '../../environment/environment';

// Modules
import supertest, { SuperTest, Test } from 'supertest';
import { Server } from 'http';

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
        it('robot one input', async () => {
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
            expect(body.coordinates).toEqual({
                x: 1,
                y: 1
            });
        });

        it('robot two input', async () => {
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
            expect(body.coordinates).toEqual({
                x: 3,
                y: 3
            });
        });

        it('robot three input', async () => {
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
            expect(body.coordinates).toEqual({
                x: 2,
                y: 3
            });
        });
    });

    describe('should fail', () => {
        it('should not create the robot if missing initial orientation', async () => {
            const { body, status } = await request
                .post('/robot')
                .send({
                    planetId: process.env.JEST_PLANET_ID,
                    coordinates: {
                        x: 0,
                        y: 3
                    },
                    positions: 'LLFFFLFLFL'
                });

            expect(status).toBe(413);
        });

        it('should not create the robot if missing coordinates', async () => {
            const { body, status } = await request
                .post('/robot')
                .send({
                    planetId: process.env.JEST_PLANET_ID,
                    orientation: 'W',
                    positions: 'LLFFFLFLFL'
                });

            expect(status).toBe(413);
        });

        it('should not create the robot if missing planetId', async () => {
            const { body, status } = await request
                .post('/robot')
                .send({
                    coordinates: {
                        x: 0,
                        y: 3
                    },
                    positions: 'LLFFFLFLFL'
                });

            expect(status).toBe(413);
        });
    })

});