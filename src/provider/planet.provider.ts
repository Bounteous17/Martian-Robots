// Modules
import { get, toString } from 'lodash';
import { Request } from 'express';
import { v4 } from 'uuid';
import Debug from 'debug';

// Types
import { planetDimensionsType, planetType } from '../types/planet.type';
import { appResponse } from '../types/http.type';

// Providers
import { validatorProvider } from './validator.provider';
import { memoryStorageProvider } from './memory-storage.provider';

// Constants
const debug: Debug.Debugger = Debug('Martian:Provider:Planet');

async function create({ body }: Request): Promise<appResponse> {
    try {
        // Define and validate planet dimensions
        const dimensions: planetDimensionsType = get(body, 'dimensions', null);
        validatorProvider.validatePlanetDimensions(dimensions);

        // Define and validate planet name
        const name: string = get(body, 'name', 'Mars');
        validatorProvider.validatePlanetName(name);

        const planet: planetType = {
            id: v4(),
            dimensions: {
                x: dimensions.x,
                y: dimensions.y
            },
            name
        };

        debug(planet);

        // We can avoid waiting for it beeing stored
        await memoryStorageProvider.set({
            key: planet.id,
            value: JSON.stringify(planet)
        });

        return {
            httpStatus: 200,
            body: planet
        }
    } catch (error) {
        debug(error);
        return error;
    }
}

export const planetProvider = {
    create
}