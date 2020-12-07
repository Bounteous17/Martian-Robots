export interface planetType {
    id: string,
    dimensions: planetDimensionsType,
    name: string,
    lostRobotsCoordinates?: planetDimensionsType[]
}

export interface planetDimensionsType {
    x: number,
    y: number
}