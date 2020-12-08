// Modules
import Debug from 'debug';
import { Request } from 'express';
import { get, lte, gte, isArray, eq, isNil } from 'lodash';

// Types
import { appResponse } from '../types/http.type';
import { planetDimensionsOrientationType, planetDimensionsType, planetType } from '../types/planet.type';

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

        // Define and validate new robot initial coordinates
        const coordinates: planetDimensionsType = get(body, 'coordinates', null);
        validatorProvider.validatePlanetDimensions(coordinates);

        // Define and validate new robot positions
        const positions: string = get(body, 'positions', null);
        validatorProvider.validateRobotPositions(positions);

        // Define and validate new robot orientation
        const orientation: string = get(body, 'orientation', null);
        validatorProvider.validateRobotOrientation(orientation);

        const result = await applyPositions({ orientation, coordinates, positions, planetId });

        return {
            httpStatus: 200,
            body: result
        };
    } catch (error) {
        debug(error);
        return error;
    }
}

async function isNonExistenCoordinate({ x, y, orientation }: planetDimensionsOrientationType, planetId: string): Promise<boolean> {
    const planet: planetType = await planetProvider.getPlanetById(planetId);
    const exists: boolean = lte(x, planet.dimensions.x) && gte(x, 0) && lte(y, planet.dimensions.y) && gte(y, 0);

    if (!exists) {
        debug(`Coordinate outside the planet ${JSON.stringify({ x, y, orientation })}`);
    }

    return exists;
}

async function setLostRobotPreviousCoordinates(coordinates: planetDimensionsOrientationType, planet: planetType): Promise<void> {
    isArray(planet.lostRobotsCoordinates) && planet.lostRobotsCoordinates.push(coordinates);

    await memoryStorageProvider.set({
        key: planet.id,
        value: JSON.stringify(planet)
    });
}

async function applyPositions({ orientation, coordinates, positions, planetId }: {
    orientation: string,
    coordinates: planetDimensionsType,
    positions: string,
    planetId: string
}): Promise<{ orientation: string, coordinate: planetDimensionsType }> {
    let currentCoordinates: planetDimensionsType = coordinates;
    let currentOrientation: string = orientation;

    let robotAlreadyLost: boolean = false;

    for (let command = 0; command < positions.split('').length && !robotAlreadyLost; command++) {
        const result = await moveToPosition({
            orientation: currentOrientation,
            coordinates: currentCoordinates,
            command: positions.split('')[command],
            planetId
        });

        robotAlreadyLost = result.lost;

        currentCoordinates = result.currentCoordinates;
        currentOrientation = result.currentOrientation;
    }

    return {
        coordinate: currentCoordinates,
        orientation: currentOrientation
    };
}

async function moveToPosition({ orientation, coordinates, command, planetId }: {
    orientation: string,
    coordinates: planetDimensionsType,
    command: string,
    planetId: string
}): Promise<{ currentCoordinates: planetDimensionsType, currentOrientation: string, lost: boolean }> {
    let lost: boolean = false;
    const planet: planetType = await planetProvider.getPlanetById(planetId);

    let currentCoordinates: planetDimensionsType = { ...coordinates };
    let currentOrientation: string = orientation;

    debug({ orientation, coordinates, command });
    const result = getNewCoordinate({ orientation, coordinates: { ...currentCoordinates }, command });
    currentOrientation = result.orientation;
    debug(result);

    const ignoreCoordinate: planetDimensionsType = planet.lostRobotsCoordinates.find(
        ({ x, y, orientation }) => eq(x, coordinates.x) && eq(y, coordinates.y) && eq(orientation, result.orientation)
    );

    if (isNil(ignoreCoordinate)) {
        const exists: boolean = await isNonExistenCoordinate({
            x: result.coordinate.x,
            y: result.coordinate.y,
            orientation: result.orientation
        }, planetId);

        if (exists) {
            currentCoordinates = {
                x: result.coordinate.x,
                y: result.coordinate.y
            };
        } else {
            const firstSlug: planetDimensionsOrientationType = planet.lostRobotsCoordinates.find((coordinate) =>
                eq(result.coordinate.x, coordinate.x) && eq(result.coordinate.y, coordinate.y)
            );

            if (isNil(firstSlug)) {
                lost = true;
            }

            setLostRobotPreviousCoordinates({
                x: result.coordinate.x,
                y: result.coordinate.y,
                orientation: result.orientation
            }, planet);
        }
    } else {
        debug(`This coordinates wasnt safe`);
    }

    debug('');

    return {
        currentCoordinates,
        currentOrientation,
        lost
    }
}

function getNewCoordinate({ orientation, coordinates, command }: {
    orientation: string,
    coordinates: planetDimensionsType,
    command: string
}): { orientation: string, coordinate: planetDimensionsType } {
    let newOrientation: string = orientation;
    let newCoordinates: planetDimensionsType = coordinates;
    const changeOrientation: boolean = eq(command, 'R') || eq(command, 'L');

    if (changeOrientation) {
        switch (orientation) {
            case 'N':
                eq(command, 'R') ? newOrientation = 'E' : newOrientation = 'W';
                break;
            case 'S':
                eq(command, 'R') ? newOrientation = 'W' : newOrientation = 'E';
                break;
            case 'E':
                eq(command, 'R') ? newOrientation = 'S' : newOrientation = 'N';
                break;
            case 'W':
                eq(command, 'R') ? newOrientation = 'N' : newOrientation = 'S';
                break;
        }
    } else if (!changeOrientation && eq(command, 'F')) {
        newCoordinates = getNewCoordinateFromOrientation({ orientation, coordinates });
    }

    const result = {
        orientation: newOrientation,
        coordinate: newCoordinates
    };

    return result;
}

function getNewCoordinateFromOrientation({ orientation, coordinates }: {
    orientation: string,
    coordinates: planetDimensionsType
}): planetDimensionsType {
    switch (orientation) {
        case 'N':
            coordinates.y++;
            break;
        case 'S':
            coordinates.y--;
            break;
        case 'E':
            coordinates.x++;
            break;
        case 'W':
            coordinates.x--;
            break;
    }

    return coordinates;
}


export const robotProvider = {
    create
}