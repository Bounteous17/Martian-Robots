// Environment
import { environment } from './environment/environment';

// Modules
import express, { Express } from 'express';
import Debug from 'debug';
import { get } from 'lodash';
import { json as parseJson } from 'body-parser';

// Routers
import planetRouter from './src/routers/planet.router';

// Constants
const debug: Debug.Debugger = Debug('Martian:App');
const port: number = get(environment, 'api.port', 1337);
export const app: Express = express();

/**
 * Add api middlewares
 */
app.use(parseJson());

/**
 * Add api rounting
 */
app.use('/planet', planetRouter);

/**
 * Add api listener
 */
environment.api.autoListen && app.listen(port, () => {
    debug(`App listening on http://0.0.0.0:${port}`);
})