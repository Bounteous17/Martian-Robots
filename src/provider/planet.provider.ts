// Modules
import { get, gte, isArray, isEmpty, lte } from 'lodash';
import { Request } from 'express';
import { v4 } from 'uuid';
import Debug from 'debug';

// Types
import { coordinatesOrientationType, coordinatesType, planetType } from '../types/planet.type';
import { appResponse } from '../types/http.type';

// Providers
import { validatorProvider } from './validator.provider';
import { memoryStorageProvider } from './memory-storage.provider';

// Constants
const debug: Debug.Debugger = Debug('Martian:Provider:Planet');

/**
 * Create planet on RedisDB with the client parameters
 */
async function create({ body }: Request): Promise<appResponse> {
    try {
        // Define and validate planet dimensions
        const dimensions: coordinatesType = get(body, 'dimensions', null);
        validatorProvider.validatePlanetDimensions(dimensions);

        // Define and validate planet name
        const name: string = get(body, 'name', 'Mars');
        validatorProvider.validatePlanetName(name);

        // Instance planet
        const planet: planetType = {
            id: v4(),
            name,
            dimensions: {
                x: dimensions.x,
                y: dimensions.y
            },
            lostRobotsCoordinates: []
        };

        debug(planet);

        // We can avoid waiting for it beeing stored removing await
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

/**
 * Get planet by id from RedisDB
 */
async function getPlanetById(id: string): Promise<planetType> {
    const value: string = await memoryStorageProvider.get(id);
    const planet: planetType = JSON.parse(value);

    if (isEmpty(planet)) {
        throw {
            httpStatus: 404,
            body: { error: 'The planet can not be found on this galaxy!' }
        } as appResponse;
    }

    return planet;
}

/**
 * If the coordinate doesn't exists on the planet it returns false
 */
async function isNonExistentCoordinate({ x, y, orientation }: coordinatesOrientationType, planetId: string): Promise<boolean> {
    const planet: planetType = await planetProvider.getPlanetById(planetId);
    const exists: boolean = lte(x, planet.dimensions.x) && gte(x, 0) && lte(y, planet.dimensions.y) && gte(y, 0);

    if (!exists) {
        debug(`Coordinate outside the planet ${JSON.stringify({ x, y, orientation })}`);
    }

    return exists;
}

/**
 * Update new lost robots coordinates for the planet
 */
async function setLostRobotPreviousCoordinates(coordinates: coordinatesOrientationType, planet: planetType): Promise<void> {
    isArray(planet.lostRobotsCoordinates) && planet.lostRobotsCoordinates.push(coordinates);

    await memoryStorageProvider.set({
        key: planet.id,
        value: JSON.stringify(planet)
    });
}

export const planetProvider = {
    create,
    getPlanetById,
    isNonExistentCoordinate,
    setLostRobotPreviousCoordinates
}