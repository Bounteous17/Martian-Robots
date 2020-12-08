// Modules
import { get, isNumber, isString, lte, isNil, eq, gte } from "lodash";

// Types
import { appResponse } from "../types/http.type";
import { coordinatesType } from "../types/planet.type";

function validatePlanetDimensions(dimensions: coordinatesType): void {
    const x: number = get(dimensions, 'x', null);
    const y: number = get(dimensions, 'y', null);

    if (!isNumber(x) || !isNumber(y)) {
        throw {
            httpStatus: 413,
            body: { error: 'X and Y non optional parameters' }
        } as appResponse;
    }

    validatePlanetCoordinates(dimensions);
}

function validatePlanetCoordinates(dimensions: coordinatesType): void {
    const x: number = get(dimensions, 'x', -1);
    const y: number = get(dimensions, 'y', -1);

    const maxCoordinate: number = 50;
    const invalidCoordinate: number = [x, y].find((value: number) => !(gte(value, 0) && lte(value, maxCoordinate)));

    if (!isNil(invalidCoordinate)) {
        throw {
            httpStatus: 413,
            body: { error: `Maximum coordinate value is ${maxCoordinate}` }
        } as appResponse;
    }
}

function validatePlanetName(name: string): void {
    // TODO: use joi
    if (!isString(name)) {
        throw {
            httpStatus: 413,
            body: { error: 'Bad name for planet' }
        } as appResponse;
    }
}

function validatePlanetId(name: string): void {
    if (isNil(name) || !name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        throw {
            httpStatus: 413,
            body: { error: `Malformed planet id -> ${name}` }
        } as appResponse;
    }
}

function validateRobotPositions(positions: string): void {
    if (isNil(positions) || !positions.match(/^[L, R, F]\S+$/)) {
        throw {
            httpStatus: 413,
            body: { error: 'Some positions command can not be recognized' }
        } as appResponse;
    }
}

function validateRobotOrientation(orientation: string): void {
    if (isNil(orientation) || (!eq(orientation, 'N') && !eq(orientation, 'S') && !eq(orientation, 'E') && !eq(orientation, 'W'))) {
        throw {
            httpStatus: 413,
            body: { error: 'Robot orientation is not valid' }
        } as appResponse;
    }
}

export const validatorProvider = {
    validatePlanetDimensions,
    validatePlanetCoordinates,
    validatePlanetName,
    validatePlanetId,
    validateRobotPositions,
    validateRobotOrientation
}