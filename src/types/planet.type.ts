export interface planetType {
    id: string,
    dimensions: planetDimensionsType,
    name: string
}

export interface planetDimensionsType {
    x: number,
    y: number
}