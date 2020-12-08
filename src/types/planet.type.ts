export interface planetType {
    id: string,
    dimensions: planetDimensionsType,
    name: string,
    lostRobotsCoordinates?: planetDimensionsOrientationType[]
}

export interface planetDimensionsType {
    x: number,
    y: number
}

export interface planetDimensionsOrientationType extends planetDimensionsType {
    orientation: string
}