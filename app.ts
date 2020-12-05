// Environment
import { environment } from './environment/environment';

// Modules
import express, { Express } from 'express';
import Debug from 'debug';
import { get } from 'lodash';

// Constants
const debug: Debug.Debugger = Debug('Martian:App');
const app: Express = express();
const port: number = get(environment, 'api.port', 1337);

/**
 * Api instancing
 */
app.listen(port, () => {
    debug(`App listening on http://0.0.0.0:${port}`);
})