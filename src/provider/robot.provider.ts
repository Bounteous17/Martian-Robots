// Modules
import Debug from 'debug';
import { Request } from 'express';
import { get, lte, gte, isArray, eq, isNil } from 'lodash';

// Types
import { appResponse } from '../types/http.type';
import { coordinatesOrientationType, coordinatesType, planetType } from '../types/planet.type';

// Providers
import { validatorProvider } from './validator.provider';
import { planetProvider } from './planet.provider';
import { memoryStorageProvider } from './memory-storage.provider';

// Constants
const debug: Debug.Debugger = Debug('Martian:Provider:Robot');

/**
 * Create robot with the initial coordinates and orientation
 */
async function create({ body }: Request): Promise<appResponse> {
    try {
        // Define and validate planet id
        const planetId: string = get(body, 'planetId', null);
        validatorProvider.validatePlanetId(planetId);

        // Define and validate new robot initial coordinates
        const coordinates: coordinatesType = get(body, 'coordinates', null);
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

/**
 * Calculate final robot position from all the commands
 */
async function applyPositions({ orientation, coordinates, positions, planetId }: {
    orientation: string,
    coordinates: coordinatesType,
    positions: string,
    planetId: string
}): Promise<{ orientation: string, coordinate: coordinatesType }> {
    let currentCoordinates: coordinatesType = coordinates;
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

/**
 * Apply tobot position from the planet preferences
 */
async function moveToPosition({ orientation, coordinates, command, planetId }: {
    orientation: string,
    coordinates: coordinatesType,
    command: string,
    planetId: string
}): Promise<{ currentCoordinates: coordinatesType, currentOrientation: string, lost: boolean }> {
    const planet: planetType = await planetProvider.getPlanetById(planetId);

    let currentCoordinates: coordinatesType = { ...coordinates };
    let currentOrientation: string = orientation;
    // If the robot get lost unexpectedly it will be true
    let lost: boolean = false;

    debug({ orientation, coordinates, command });
    const result = getNewCoordinate({ orientation, coordinates: { ...currentCoordinates }, command });
    currentOrientation = result.orientation;
    debug(result);
    debug('');

    // If this positions is known from some previous lost robot, this comand is ignored
    const ignoreCoordinate: coordinatesType = planet.lostRobotsCoordinates.find(
        ({ x, y, orientation }) => eq(x, coordinates.x) && eq(y, coordinates.y) && eq(orientation, result.orientation)
    );

    if (isNil(ignoreCoordinate)) {
        const exists: boolean = await planetProvider.isNonExistentCoordinate({
            x: result.coordinate.x,
            y: result.coordinate.y,
            orientation: result.orientation
        }, planetId);

        // If the new robot coordinates is valid the new position is updated
        if (exists) {
            currentCoordinates = {
                x: result.coordinate.x,
                y: result.coordinate.y
            };
        } else {
            // Get if the new coordinates exists from already lost robots coordinates
            const positionScent: coordinatesOrientationType = planet.lostRobotsCoordinates.find((coordinate) =>
                eq(result.coordinate.x, coordinate.x) && eq(result.coordinate.y, coordinate.y)
            );

            // If it's the first time a robot get lost for this coordinates scent is null
            if (isNil(positionScent)) {
                lost = true;
            }

            // Update the lost robot coordinates for the planet
            await planetProvider.setLostRobotPreviousCoordinates({
                x: result.coordinate.x,
                y: result.coordinate.y,
                orientation: result.orientation
            }, planet);
        }
    }

    return {
        currentCoordinates,
        currentOrientation,
        lost
    }
}

/**
 * Calculate new position from command
 */
function getNewCoordinate({ orientation, coordinates, command }: {
    orientation: string,
    coordinates: coordinatesType,
    command: string
}): { orientation: string, coordinate: coordinatesType } {
    let newOrientation: string = orientation;
    let newCoordinates: coordinatesType = coordinates;

    // It's true if command different to forward
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
        newCoordinates = getNewCoordinatesFromOrientation({ orientation, coordinates });
    }

    return {
        orientation: newOrientation,
        coordinate: newCoordinates
    };
}

/**
 * Calculate coordinates from orientation
 */
function getNewCoordinatesFromOrientation({ orientation, coordinates }: {
    orientation: string,
    coordinates: coordinatesType
}): coordinatesType {
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