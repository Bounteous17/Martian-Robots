// Modules
import { isNil } from 'lodash';
import { createClient, RedisClient } from 'redis';

let client: RedisClient;

function getClient(): RedisClient {
    if (isNil(client)) {
        client = createClient();
    }

    return client;
}

function closeClient(): void {
    if (!isNil(client)) {
        client.end(true);
    }
}

async function set({ key, value }: { key: string, value: string }): Promise<void> {
    await getClient().set(key, value);
}

export const memoryStorageProvider = {
    getClient,
    closeClient,
    set
}