// Modules
import { get, isNumber, isString } from "lodash";

// Types
import { appResponse } from "../types/http.type";
import { planetDimensionsType } from "../types/planet.type";

export function validatePlanetDimensions(dimensions: planetDimensionsType): void {
    const x: number = get(dimensions, 'x', null);
    const y: number = get(dimensions, 'y', null);

    if (!isNumber(x) || !isNumber(y)) {
        throw {
            httpStatus: 413,
            body: { error: 'X and Y non optional parameters' }
        } as appResponse;
    }
}

export function validatePlanetName(name: string): void {
    if (!isString(name)) {
        throw {
            httpStatus: 413,
            body: { error: 'Bad name for planet' }
        } as appResponse;
    }
}

export const validatorProvider = {
    validatePlanetDimensions,
    validatePlanetName
}