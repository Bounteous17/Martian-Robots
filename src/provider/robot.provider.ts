// Modules
import Debug from 'debug';
import { Request } from 'express';
import { get, eq, isNil } from 'lodash';

// Types
import { appResponse } from '../types/http.type';
import { coordinatesOrientationType, coordinatesType, planetType } from '../types/planet.type';

// Providers
import { validatorProvider } from './validator.provider';
import { planetProvider } from './planet.provider';

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
}): Promise<{ orientation: string, coordinates: coordinatesType, robotLostUnexpectedly: boolean }> {
    let currentCoordinates: coordinatesType = { ...coordinates };
    let currentOrientation: string = orientation;
    let robotLostUnexpectedly: boolean = false;
    const commands: string[] = positions.split('');

    // Apply commands sequentially
    for (let command = 0; command < commands.length && !robotLostUnexpectedly; command++) {
        // The result can be the same because the planet have memory from lost robots
        const result = await moveToPosition({
            orientation: currentOrientation,
            coordinates: currentCoordinates,
            command: commands[command],
            planetId
        });

        // If the robot get lost for the first time the following commands are ignored
        robotLostUnexpectedly = result.robotLostUnexpectedly;

        // Update the coordinates from the result for the next command
        currentCoordinates = result.currentCoordinates;
        currentOrientation = result.currentOrientation;
    }

    return {
        coordinates: currentCoordinates,
        orientation: currentOrientation,
        robotLostUnexpectedly
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
}): Promise<{ currentCoordinates: coordinatesType, currentOrientation: string, robotLostUnexpectedly: boolean }> {
    const planet: planetType = await planetProvider.getPlanetById(planetId);

    let currentCoordinates: coordinatesType = { ...coordinates };
    let currentOrientation: string = orientation;
    // If the robot get lost unexpectedly it will be true
    let robotLostUnexpectedly: boolean = false;

    const updatedPosition = getNewCoordinate({ orientation, coordinates: { ...currentCoordinates }, command });
    currentOrientation = updatedPosition.orientation;

    debug({ orientation, coordinates, command });
    debug(updatedPosition);
    debug('');

    // If this positions is known from some previous lost robot, this comand is ignored
    const ignoreCoordinateFromPlanetMemory: coordinatesType = planet.lostRobotsCoordinates.find(
        ({ x, y, orientation }) => eq(x, coordinates.x) && eq(y, coordinates.y) && eq(orientation, updatedPosition.orientation)
    );

    if (isNil(ignoreCoordinateFromPlanetMemory)) {
        const exists: boolean = await planetProvider.isNonExistentCoordinate({
            x: updatedPosition.coordinate.x,
            y: updatedPosition.coordinate.y,
            orientation: updatedPosition.orientation
        }, planetId);

        // If the new robot coordinates is valid the new position is updated
        if (exists) {
            currentCoordinates = {
                x: updatedPosition.coordinate.x,
                y: updatedPosition.coordinate.y
            };
        } else {
            // Get if the new coordinates exists from already lost robots coordinates
            const positionScent: coordinatesOrientationType = planet.lostRobotsCoordinates.find((coordinate) =>
                eq(updatedPosition.coordinate.x, coordinate.x) && eq(updatedPosition.coordinate.y, coordinate.y)
            );

            // If it's the first time a robot get lost for this coordinates scent is null
            if (isNil(positionScent)) {
                robotLostUnexpectedly = true;
            }

            // Update the lost robot coordinates for the planet
            await planetProvider.setLostRobotPreviousCoordinates({
                x: updatedPosition.coordinate.x,
                y: updatedPosition.coordinate.y,
                orientation: updatedPosition.orientation
            }, planet);
        }
    }

    return {
        currentCoordinates,
        currentOrientation,
        robotLostUnexpectedly
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
    let updatedPosition: coordinatesType = coordinates;

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
        updatedPosition = getupdatedPositionFromOrientation({ orientation, coordinates });
    }

    return {
        orientation: newOrientation,
        coordinate: updatedPosition
    };
}

/**
 * Calculate coordinates from orientation
 */
function getupdatedPositionFromOrientation({ orientation, coordinates }: {
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