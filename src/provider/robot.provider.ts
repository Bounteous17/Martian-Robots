// Modules
import Debug from 'debug';
import { Request } from 'express';
import { get, isEmpty, gt } from 'lodash';

// Types
import { appResponse } from '../types/http.type';
import { planetDimensionsType, planetType } from '../types/planet.type';

// Providers
import { validatorProvider } from './validator.provider';
import { planetProvider } from './planet.provider';
import { memoryStorageProvider } from './memory-storage.provider';

// Constants
const debug: Debug.Debugger = Debug('Martian:Provider:Robot');

async function create({ body }: Request): Promise<appResponse> {
    try {
        // Define and validate planet id
        const planetId: string = get(body, 'planetId', null);
        validatorProvider.validatePlanetId(planetId);

        // Define and validate new robot coordinates
        const coordinates: planetDimensionsType = get(body, 'coordinates', null);
        validatorProvider.validatePlanetDimensions(coordinates);

        await findNonExistenCoordinates(coordinates, planetId);

        return {
            httpStatus: 200,
            body: { message: 'Robot created successfully!' }
        };
    } catch (error) {
        debug(error);
        return error;
    }
}

async function findNonExistenCoordinates({ x, y }: planetDimensionsType, planetId: string): Promise<planetDimensionsType[]> {
    const planet: planetType = await planetProvider.getPlanetById(planetId);

    if (isEmpty(planet)) {
        throw {
            httpStatus: 404,
            body: { error: 'The planet can not be found on this galaxy!' }
        } as appResponse;
    }

    const lostCoordinates: planetDimensionsType[] = planet.lostRobotsCoordinates;
    lostCoordinates.push({ x: planet.dimensions.x, y: planet.dimensions.y });

    const foundLostCoordinates: planetDimensionsType[] =
        lostCoordinates.filter(({ x, y }) => gt(x, planet.dimensions.x) || gt(y, planet.dimensions.y));

    !isEmpty(foundLostCoordinates) && await markLostRobot(foundLostCoordinates, planet);

    return foundLostCoordinates;
}

async function markLostRobot(coordinates: planetDimensionsType[], planet: planetType): Promise<void> {
    planet.lostRobotsCoordinates.concat(coordinates);

    await memoryStorageProvider.set({
        key: planet.id,
        value: JSON.stringify(planet)
    });
}

export const robotProvider = {

}