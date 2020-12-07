// Environment
import { environment } from '../../environment/environment';

// Modules
import { isNil } from 'lodash';
import { createClient, RedisClient } from 'redis';
import { promisify } from 'util';

let client: RedisClient;
let clientGet;
let clientSet;

function getClient(): RedisClient {
    if (isNil(client)) {
        client = createClient(environment.redis);
    }

    return client;
}

function getClientGet() {
    getClient();

    if (isNil(clientGet)) {
        clientGet = promisify(client.get).bind(client);
    }

    return clientGet;
}

function getClientSet() {
    getClient();

    if (isNil(clientGet)) {
        clientSet = promisify(client.set).bind(client);
    }

    return clientSet;
}

function closeClient(): void {
    if (!isNil(client)) {
        client.end(true);
    }
}

async function set({ key, value }: { key: string, value: string }): Promise<void> {
    await getClientSet()(key, value);
}

async function get(key: string): Promise<string> {
    return await getClientGet()(key);
}

export const memoryStorageProvider = {
    getClient,
    closeClient,
    set,
    get
}