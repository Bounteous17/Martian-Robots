// Modules
import { get, isObject } from 'lodash';

function getAppResponse(response: Record<string, any>): { status: number, body: Record<string, any> } {
    if (!isObject(response)) {
        return {
            status: 500,
            body: { error: 'Try again in a few minutes ...' }
        }
    }

    const status: number = get(response, 'httpStatus', 500);
    const body: Record<string, any> | string = get(response, 'body', {});

    return {
        status,
        body: isObject(body) ? body : {}
    };
}

export const apiProvider = {
    getAppResponse
}