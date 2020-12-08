// Environment
import { environment } from './environment/environment';

// Modules
import express, { Express, NextFunction, Request, Response } from 'express';
import Debug from 'debug';
import { get } from 'lodash';
import { json as parseJson } from 'body-parser';
import { v4 } from 'uuid';
import cors from 'cors';

// Routers
import planetRouter from './src/routers/planet.router';
import robotRouter from './src/routers/robot.router';

// Constants
const debug: Debug.Debugger = Debug('Martian:App');
const port: number = get(environment, 'api.port', 1337);
export const app: Express = express();

/**
 * Add api middlewares
 */
app.use(cors());
app.use(parseJson());
app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId: string = v4();
    request.headers['x-request-id'] = requestId;
    debug(`New request ${requestId} from ${request.connection.remoteAddress}`);
    next();
});

/**
 * Add api public rounting
 */
app.use('/planet', planetRouter);
app.use('/robot', robotRouter);

/**
 * Add api listener
 */
environment.api.autoListen && app.listen(port, () => {
    debug(`App listening on http://0.0.0.0:${port}`);
})