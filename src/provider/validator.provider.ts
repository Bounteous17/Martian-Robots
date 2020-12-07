// Modules
import { get, isNumber, isString, lte, gt, isNil } from "lodash";

// Types
import { appResponse } from "../types/http.type";
import { planetDimensionsType } from "../types/planet.type";

function validatePlanetDimensions(dimensions: planetDimensionsType): void {
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

function validatePlanetCoordinates(dimensions: planetDimensionsType): void {
    const x: number = get(dimensions, 'x', -1);
    const y: number = get(dimensions, 'y', -1);

    const maxCoordinate: number = 50;
    const invalidCoordinate: number = [x, y].find((value: number) => !(gt(value, 0) && lte(value, maxCoordinate)));

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
            body: { error: 'Bad planet id' }
        } as appResponse;
    }
}

export const validatorProvider = {
    validatePlanetDimensions,
    validatePlanetCoordinates,
    validatePlanetName,
    validatePlanetId
}